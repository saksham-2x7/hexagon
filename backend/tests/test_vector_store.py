"""
Unit and integration tests for VectorStore and LocalDenseEmbeddingEngine (Milestone 3).
Verifies embedding properties, persistent storage, document scoping, and pipeline integration.
"""

import io
from pathlib import Path
import numpy as np
import pytest
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.rag.chunker import DocumentChunk, SemanticChunker
from app.rag.document_processor import DocumentProcessor
from app.rag.exceptions import EmbeddingError, VectorStoreError
from app.rag.vector_store import (
    LocalDenseEmbeddingEngine,
    QueryResult,
    VectorStore,
)


@pytest.fixture
def sample_chunks() -> list[DocumentChunk]:
    """Fixture providing dummy educational DocumentChunk objects."""
    chunk1 = DocumentChunk(
        chunk_id="ml_intro_c0",
        text="Chapter 1: Supervised learning uses labeled training datasets to train predictive models.",
        page_numbers=[1],
        primary_page=1,
        section_title="Chapter 1: Supervised Learning",
        chunk_index=0,
        char_count=88,
        token_count=22,
        metadata={"subject": "Machine Learning"},
    )
    chunk2 = DocumentChunk(
        chunk_id="ml_intro_c1",
        text="Chapter 2: Neural networks and deep learning use gradient descent and backpropagation.",
        page_numbers=[2],
        primary_page=2,
        section_title="Chapter 2: Neural Networks",
        chunk_index=1,
        char_count=87,
        token_count=22,
        metadata={"subject": "Deep Learning"},
    )
    chunk3 = DocumentChunk(
        chunk_id="ml_intro_c2",
        text="Section 2.1: Convolutional neural networks (CNNs) specialize in processing grid-like image data.",
        page_numbers=[2, 3],
        primary_page=2,
        section_title="Section 2.1: CNNs",
        chunk_index=2,
        char_count=96,
        token_count=24,
        metadata={"subject": "Computer Vision"},
    )
    return [chunk1, chunk2, chunk3]


# ----------------------------------------------------------------------
# Embedding Engine Tests
# ----------------------------------------------------------------------

def test_local_embedding_engine_dimension_and_norm():
    """Verify embedding dimension is 384 and vectors are L2-normalized."""
    engine = LocalDenseEmbeddingEngine(dimension=384)
    text = "Artificial intelligence and machine learning foundations."
    emb = engine.embed_text(text)

    assert len(emb) == 384
    norm = np.linalg.norm(np.array(emb, dtype=np.float32))
    assert abs(norm - 1.0) < 1e-4


def test_embedding_semantic_similarity_ranking():
    """Verify semantically related texts have higher cosine similarity than unrelated texts."""
    engine = LocalDenseEmbeddingEngine(dimension=384)
    v_ai = np.array(engine.embed_text("Introduction to artificial intelligence algorithms"))
    v_ml = np.array(engine.embed_text("Machine learning algorithms and neural models"))
    v_cook = np.array(engine.embed_text("How to make tomato soup with basil and garlic"))

    sim_ai_ml = float(np.dot(v_ai, v_ml))
    sim_ai_cook = float(np.dot(v_ai, v_cook))

    assert sim_ai_ml > sim_ai_cook
    assert sim_ai_ml > 0.1


def test_embedding_batch():
    """Verify batch embedding generation."""
    engine = LocalDenseEmbeddingEngine(dimension=384)
    texts = ["Sentence one.", "Sentence two.", "Sentence three."]
    batch_embs = engine.embed_batch(texts)

    assert len(batch_embs) == 3
    for emb in batch_embs:
        assert len(emb) == 384


# ----------------------------------------------------------------------
# VectorStore Storage & Retrieval Tests
# ----------------------------------------------------------------------

def test_store_chunks_and_count(tmp_path, sample_chunks):
    """Test storing chunks in VectorStore and asserting correct counts."""
    store = VectorStore(persist_directory=tmp_path)

    stored_count = store.store_chunks(document_id="doc_ml_101", chunks=sample_chunks)
    assert stored_count == 3
    assert store.count() == 3
    assert store.count(document_id="doc_ml_101") == 3
    assert store.count(document_id="non_existent") == 0


def test_get_chunk_by_id(tmp_path, sample_chunks):
    """Test single chunk retrieval via get(chunk_id)."""
    store = VectorStore(persist_directory=tmp_path)
    store.store_chunks(document_id="doc_ml_101", chunks=sample_chunks)

    chunk = store.get("ml_intro_c1")
    assert chunk is not None
    assert isinstance(chunk, QueryResult)
    assert chunk.chunk_id == "ml_intro_c1"
    assert chunk.primary_page == 2
    assert "Neural networks" in chunk.text
    assert chunk.section_title == "Chapter 2: Neural Networks"
    assert chunk.metadata["subject"] == "Deep Learning"


def test_vector_query_similarity_search(tmp_path, sample_chunks):
    """Test vector similarity search query returning ranked results."""
    store = VectorStore(persist_directory=tmp_path)
    store.store_chunks(document_id="doc_ml_101", chunks=sample_chunks)

    # Query specifically targeting CNNs
    results = store.query(query_text="convolutional neural networks for images", top_k=2)

    assert len(results) > 0
    top_result = results[0]
    assert "Convolutional neural networks" in top_result.text
    assert top_result.score > 0.0
    assert top_result.primary_page == 2
    assert top_result.section_title == "Section 2.1: CNNs"


# ----------------------------------------------------------------------
# Persistence & Reload Tests
# ----------------------------------------------------------------------

def test_vector_store_persistence_across_reloads(tmp_path, sample_chunks):
    """Verify data persisted in SQLite survives closing and re-opening VectorStore."""
    # Instance 1: Store chunks
    store1 = VectorStore(persist_directory=tmp_path)
    store1.store_chunks(document_id="doc_ml_101", chunks=sample_chunks)
    assert store1.count() == 3

    # Instance 2: Re-open from same directory
    store2 = VectorStore(persist_directory=tmp_path)
    assert store2.count() == 3

    query_results = store2.query(query_text="supervised learning predictive models", top_k=1)
    assert len(query_results) == 1
    assert "Supervised learning" in query_results[0].text
    assert query_results[0].document_id == "doc_ml_101"


# ----------------------------------------------------------------------
# Scoping & Deletion Tests
# ----------------------------------------------------------------------

def test_document_scoping_and_deletion(tmp_path):
    """Test document scoping and deletion isolating document collections."""
    store = VectorStore(persist_directory=tmp_path)

    algebra_chunks = [
        DocumentChunk(
            chunk_id="alg_1",
            text="Linear algebra covers matrices and eigenvalues.",
            page_numbers=[1],
            primary_page=1,
            section_title="Algebra",
            chunk_index=0,
            char_count=45,
            token_count=12,
        )
    ]
    physics_chunks = [
        DocumentChunk(
            chunk_id="phys_1",
            text="Quantum mechanics explores wave-particle duality.",
            page_numbers=[1],
            primary_page=1,
            section_title="Physics",
            chunk_index=0,
            char_count=49,
            token_count=13,
        )
    ]

    store.store_chunks(document_id="doc_algebra", chunks=algebra_chunks)
    store.store_chunks(document_id="doc_physics", chunks=physics_chunks)

    assert store.count() == 2
    assert store.count(document_id="doc_algebra") == 1
    assert store.count(document_id="doc_physics") == 1

    # Query scoped to doc_algebra only
    alg_results = store.query(query_text="quantum physics", document_id="doc_algebra", top_k=5)
    for res in alg_results:
        assert res.document_id == "doc_algebra"

    # Delete doc_algebra
    deleted = store.delete_document("doc_algebra")
    assert deleted == 1
    assert store.count(document_id="doc_algebra") == 0
    assert store.count(document_id="doc_physics") == 1


# ----------------------------------------------------------------------
# End-to-End Pipeline Integration Test (Milestones 1 -> 2 -> 3)
# ----------------------------------------------------------------------

def test_end_to_end_m1_m2_m3_pipeline(tmp_path):
    """Verify complete pipeline: PDF -> Extract -> Semantic Chunk -> VectorStore -> Query."""
    # 1. Generate educational PDF
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    c.drawString(72, 750, "Chapter 1: Operating Systems and Concurrency")
    c.drawString(72, 720, "Threads share memory within a process while mutexes prevent race conditions.")
    c.drawString(72, 690, "Semaphores and conditional variables synchronize concurrent access.")
    c.showPage()
    c.drawString(72, 750, "Chapter 2: Database Storage Engines")
    c.drawString(72, 720, "B-Trees and Log-Structured Merge (LSM) trees structure relational data.")
    c.drawString(72, 690, "Write-Ahead Logging (WAL) guarantees atomicity and durability in transactions.")
    c.showPage()
    c.save()
    pdf_bytes = buf.getvalue()

    # 2. Extract & Chunk
    extracted_doc = DocumentProcessor.extract_text(pdf_bytes, file_name="os_databases.pdf", file_type="pdf")
    chunker = SemanticChunker(chunk_size_chars=200, chunk_overlap_chars=40)
    chunked_doc = chunker.chunk_document(extracted_doc)
    assert chunked_doc.total_chunks >= 2

    # 3. Store in VectorStore
    store = VectorStore(persist_directory=tmp_path)
    stored_count = store.store_chunks(document_id="doc_cs_301", chunks=chunked_doc.chunks)
    assert stored_count == chunked_doc.total_chunks

    # 4. Semantic vector search
    query_results = store.query(query_text="synchronization mutexes race conditions", document_id="doc_cs_301", top_k=1)
    assert len(query_results) == 1
    assert "mutexes" in query_results[0].text
    assert query_results[0].primary_page == 1
    assert "Chapter 1" in query_results[0].section_title
