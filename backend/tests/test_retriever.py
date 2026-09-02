"""
Unit and integration tests for RAGRetriever and GroundedContext formatting (Milestone 4).
Verifies source header formatting, similarity score filtering, hallucination prevention,
and end-to-end RAG pipeline from PDF to prompt context.
"""

import io
from pathlib import Path
import pytest
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.rag.chunker import DocumentChunk, SemanticChunker
from app.rag.document_processor import DocumentProcessor
from app.rag.retriever import (
    GroundedContext,
    GroundedSource,
    RAGRetriever,
    retrieve_grounded_context,
)
from app.rag.vector_store import VectorStore


@pytest.fixture
def populated_vector_store(tmp_path) -> tuple[VectorStore, str]:
    """Fixture providing a persistent VectorStore pre-populated with educational chunks."""
    store = VectorStore(persist_directory=tmp_path)
    doc_id = "doc_neuro_201"

    chunks = [
        DocumentChunk(
            chunk_id="chunk_neuro_1",
            text="Chapter 1: Neuroplasticity is the brain's ability to reorganize itself by forming new neural connections.",
            page_numbers=[1],
            primary_page=1,
            section_title="Chapter 1: Neuroplasticity",
            chunk_index=0,
            char_count=107,
            token_count=27,
            metadata={"subject": "Neuroscience"},
        ),
        DocumentChunk(
            chunk_id="chunk_neuro_2",
            text="Section 1.1: Synaptic pruning eliminates weaker synaptic contacts while strengthening stronger connections during learning.",
            page_numbers=[2],
            primary_page=2,
            section_title="Section 1.1: Synaptic Pruning",
            chunk_index=1,
            char_count=124,
            token_count=31,
            metadata={"subject": "Neuroscience"},
        ),
        DocumentChunk(
            chunk_id="chunk_neuro_3",
            text="Chapter 2: Long-Term Potentiation (LTP) is a persistent strengthening of synapses based on recent patterns of activity.",
            page_numbers=[3, 4],
            primary_page=3,
            section_title="Chapter 2: Long-Term Potentiation",
            chunk_index=2,
            char_count=120,
            token_count=30,
            metadata={"subject": "Neuroscience"},
        ),
    ]

    store.store_chunks(document_id=doc_id, chunks=chunks)
    return store, doc_id


# ----------------------------------------------------------------------
# Header Formatting Tests
# ----------------------------------------------------------------------

def test_format_source_header_single_page():
    """Verify single page header formatting with section and document ID."""
    header = RAGRetriever.format_source_header(
        primary_page=1,
        page_numbers=[1],
        section_title="Chapter 1: Intro",
        document_id="doc_bio_101",
    )
    assert header == "--- [Source: Page 1 | Section: Chapter 1: Intro | Document: doc_bio_101] ---"


def test_format_source_header_multi_page():
    """Verify multi-page header formatting."""
    header = RAGRetriever.format_source_header(
        primary_page=2,
        page_numbers=[2, 3],
        section_title="2.1 Synapses",
        document_id="doc_bio_101",
    )
    assert header == "--- [Source: Pages 2, 3 | Section: 2.1 Synapses | Document: doc_bio_101] ---"


def test_format_source_header_no_section():
    """Verify header formatting when section title is None."""
    header = RAGRetriever.format_source_header(
        primary_page=5,
        page_numbers=[5],
        section_title=None,
        document_id="doc_bio_101",
    )
    assert header == "--- [Source: Page 5 | Document: doc_bio_101] ---"


# ----------------------------------------------------------------------
# Grounded Context Retrieval Tests
# ----------------------------------------------------------------------

def test_retrieve_grounded_context_basic(populated_vector_store):
    """Test retrieving grounded context for an educational query."""
    store, doc_id = populated_vector_store
    retriever = RAGRetriever(vector_store=store, default_top_k=2)

    context = retriever.retrieve_grounded_context(
        query="Explain synaptic pruning and how connections strengthen",
        document_id=doc_id,
    )

    assert isinstance(context, GroundedContext)
    assert context.has_context is True
    assert context.retrieved_count > 0
    assert len(context.sources) == context.retrieved_count
    assert context.document_id == doc_id

    # Verify top match is chunk 2 (Synaptic pruning)
    top_source = context.sources[0]
    assert "Synaptic pruning" in top_source.text
    assert top_source.primary_page == 2
    assert top_source.section_title == "Section 1.1: Synaptic Pruning"
    assert top_source.score > 0.0

    # Verify formatted text contains source headers and clean text
    assert "--- [Source: Page 2 | Section: Section 1.1: Synaptic Pruning | Document: doc_neuro_201] ---" in context.formatted_context_text
    assert "Synaptic pruning eliminates" in context.formatted_context_text


def test_retrieve_grounded_context_multi_page_chunk(populated_vector_store):
    """Test retrieval of multi-page chunk correctly lists page spans in context header."""
    store, doc_id = populated_vector_store
    retriever = RAGRetriever(vector_store=store, default_top_k=1)

    context = retriever.retrieve_grounded_context(
        query="What is Long-Term Potentiation LTP?",
        document_id=doc_id,
    )

    assert context.has_context is True
    assert len(context.sources) == 1
    assert context.sources[0].page_numbers == [3, 4]
    assert "--- [Source: Pages 3, 4 | Section: Chapter 2: Long-Term Potentiation | Document: doc_neuro_201] ---" in context.formatted_context_text


# ----------------------------------------------------------------------
# Score Thresholding & Fallback Tests
# ----------------------------------------------------------------------

def test_score_threshold_filters_unrelated_queries(populated_vector_store):
    """Test that setting high score threshold excludes low-relevance noise."""
    store, doc_id = populated_vector_store
    retriever = RAGRetriever(vector_store=store)

    # Impossibly high threshold to simulate off-topic query filtering
    context = retriever.retrieve_grounded_context(
        query="How to repair an automobile transmission?",
        document_id=doc_id,
        score_threshold=0.99,
    )

    assert context.has_context is False
    assert context.retrieved_count == 0
    assert context.sources == []
    assert "No relevant context found" in context.formatted_context_text


def test_non_existent_document_returns_empty_context(populated_vector_store):
    """Test querying non-existent document_id returns safe empty context."""
    store, _ = populated_vector_store
    retriever = RAGRetriever(vector_store=store)

    context = retriever.retrieve_grounded_context(
        query="Neuroplasticity",
        document_id="non_existent_doc_id_999",
    )

    assert context.has_context is False
    assert context.retrieved_count == 0
    assert context.sources == []
    assert "No relevant context found" in context.formatted_context_text


def test_empty_query_string_handling(populated_vector_store):
    """Test empty or whitespace query gracefully returns empty context."""
    store, doc_id = populated_vector_store
    retriever = RAGRetriever(vector_store=store)

    context = retriever.retrieve_grounded_context(
        query="   ",
        document_id=doc_id,
    )

    assert context.has_context is False
    assert context.retrieved_count == 0


# ----------------------------------------------------------------------
# Serialization Tests
# ----------------------------------------------------------------------

def test_grounded_context_to_dict_serialization(populated_vector_store):
    """Test to_dict() serialization for GroundedContext and GroundedSource."""
    store, doc_id = populated_vector_store
    context = retrieve_grounded_context(
        query="neuroplasticity neural connections",
        document_id=doc_id,
        top_k=1,
        vector_store=store,
    )

    doc_dict = context.to_dict()
    assert isinstance(doc_dict, dict)
    assert doc_dict["query"] == "neuroplasticity neural connections"
    assert doc_dict["document_id"] == doc_id
    assert doc_dict["has_context"] is True
    assert doc_dict["retrieved_count"] == 1
    assert isinstance(doc_dict["sources"], list)
    assert doc_dict["sources"][0]["primary_page"] == 1
    assert "formatted_context_text" in doc_dict


# ----------------------------------------------------------------------
# End-to-End Pipeline (Milestones 1 -> 2 -> 3 -> 4)
# ----------------------------------------------------------------------

def test_full_pipeline_m1_m2_m3_m4(tmp_path):
    """
    Test full end-to-end RAG ingestion and retrieval pipeline:
    1. Educational PDF creation (Milestone 1)
    2. Text extraction (Milestone 1)
    3. Semantic chunking with headers & pages (Milestone 2)
    4. VectorStore embedding & persistence (Milestone 3)
    5. Prompt-ready GroundedContext retrieval with citations (Milestone 4)
    """
    # 1. Create synthetic textbook PDF
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    c.drawString(72, 750, "Chapter 1: Principles of Quantum Physics")
    c.drawString(72, 720, "Quantum superposition states that particles exist across multiple states simultaneously.")
    c.drawString(72, 690, "Wave function collapse occurs upon quantum measurement.")
    c.showPage()
    c.drawString(72, 750, "Chapter 2: Quantum Entanglement")
    c.drawString(72, 720, "Entangled pairs share interconnected physical states regardless of spatial distance.")
    c.drawString(72, 690, "Bell tests experimentally validate non-local quantum correlations.")
    c.showPage()
    c.save()
    pdf_bytes = buf.getvalue()

    # 2. Extract text (Milestone 1)
    extracted_doc = DocumentProcessor.extract_text(pdf_bytes, file_name="quantum_physics.pdf", file_type="pdf")
    assert extracted_doc.total_pages == 2

    # 3. Semantic chunking (Milestone 2)
    chunker = SemanticChunker(chunk_size_chars=200, chunk_overlap_chars=40)
    chunked_doc = chunker.chunk_document(extracted_doc)
    assert chunked_doc.total_chunks >= 2

    # 4. Ingest into VectorStore (Milestone 3)
    store = VectorStore(persist_directory=tmp_path)
    doc_id = "doc_quantum_phy_301"
    stored_count = store.store_chunks(document_id=doc_id, chunks=chunked_doc.chunks)
    assert stored_count == chunked_doc.total_chunks

    # 5. Retrieve grounded context (Milestone 4)
    context = retrieve_grounded_context(
        query="Explain quantum entanglement and Bell tests",
        document_id=doc_id,
        top_k=2,
        vector_store=store,
    )

    assert context.has_context is True
    assert context.retrieved_count >= 1
    assert "Entangled pairs" in context.formatted_context_text
    assert "--- [Source: Page 2 | Section: Chapter 2: Quantum Entanglement | Document: doc_quantum_phy_301] ---" in context.formatted_context_text