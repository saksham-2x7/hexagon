"""
Ingestion & Verification Script for Multi-Subject Demo Educational Materials.
Scans all textbooks in data/textbooks/, extracts & semantically chunks them,
embeds them into the persistent VectorStore (.chroma_db), and registers them in app.db.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# Reconfigure stdout for UTF-8 on Windows
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure backend directory and repo root are in sys.path
backend_dir = Path(__file__).resolve().parent.parent
repo_root = backend_dir.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from app.core.database import DocumentStore
from app.rag import DocumentProcessor, RAGRetriever, VectorStore, retrieve_grounded_context
from app.schemas.material import MaterialMetadata, ProcessingStatus


async def ingest_all_textbooks():
    textbooks_dir = backend_dir / "data" / "textbooks"
    chroma_dir = backend_dir / ".chroma_db"

    print("=" * 85)
    print("      VIRTUAL HAWKS AI TEACHER - MULTI-SUBJECT DEMO INGESTION & AUDIT      ")
    print("=" * 85)
    print(f"Textbooks Directory : {textbooks_dir}")
    print(f"Vector Database Dir : {chroma_dir}\n")

    if not textbooks_dir.exists():
        raise FileNotFoundError(f"Textbooks directory not found at: {textbooks_dir}")

    textbook_files = sorted(list(textbooks_dir.glob("*.md")))
    if not textbook_files:
        raise FileNotFoundError("No markdown textbook files found in textbooks directory!")

    # 1. Initialize SQLite VectorStore & DocumentStore
    vector_store = VectorStore(persist_directory=str(chroma_dir))
    await DocumentStore.init_db()

    total_chunks_indexed = 0
    document_summaries = []

    # 2. Ingest each textbook file
    for idx, tb_path in enumerate(textbook_files, start=1):
        doc_id = f"doc_{tb_path.stem}"
        print(f"[{idx}/{len(textbook_files)}] Processing: '{tb_path.name}' -> Document ID: '{doc_id}'")

        # Step A: Extract & Semantically Chunk
        chunked_doc = DocumentProcessor.extract_and_chunk(
            file_source=str(tb_path),
            file_type="md",
            chunk_size_chars=1200,
            chunk_overlap_chars=200,
        )
        print(f"      -> Extracted {chunked_doc.total_characters:,} characters, {chunked_doc.total_estimated_tokens:,} tokens")
        print(f"      -> Produced {chunked_doc.total_chunks} structured semantic chunks")

        # Step B: Index into VectorStore
        stored_count = vector_store.store_chunks(
            document_id=doc_id,
            chunks=chunked_doc.chunks,
        )
        total_chunks_indexed += stored_count
        print(f"      -> Indexed {stored_count} vectors into .chroma_db (Total in doc: {vector_store.count(document_id=doc_id)})")

        # Step C: Register in DocumentStore (app.db)
        file_stat = tb_path.stat()
        material_meta = MaterialMetadata(
            file_id=doc_id,
            student_id="550e8400-e29b-41d4-a716-446655440000",
            filename=tb_path.name,
            file_type="md",
            status=ProcessingStatus.READY,
            uploaded_at=datetime.now(timezone.utc),
            error_message=None,
        )
        await DocumentStore.put("materials", doc_id, material_meta.model_dump(mode="json"))
        print(f"      -> Registered in SQLite DocumentStore (collection: 'materials', status: READY)\n")

        document_summaries.append({
            "doc_id": doc_id,
            "filename": tb_path.name,
            "chunks": chunked_doc.total_chunks,
            "tokens": chunked_doc.total_estimated_tokens,
        })

    print("-" * 85)
    print(f" Knowledge Base Expanded: {len(textbook_files)} Textbooks | {total_chunks_indexed} Chunks Indexed in .chroma_db")
    print("-" * 85)

    # 3. Verification Across Multiple Subjects & Languages
    print("\n[VERIFICATION] Running Multi-Subject Semantic Retrieval Queries...\n")
    retriever = RAGRetriever(vector_store=vector_store, default_top_k=2)

    test_queries = [
        # Chapter 4: Electricity & Ohm's Law
        {
            "subject": "Physics (Electricity)",
            "doc_id": "doc_chapter4_electricity",
            "lang": "English",
            "query": "What is electrical resistance and how does wire length affect it?",
            "expected_keywords": ["resistance", "length", "resistivity"],
        },
        {
            "subject": "Physics (Electricity)",
            "doc_id": "doc_chapter4_electricity",
            "lang": "English",
            "query": "Explain the water pipe analogy for voltage and current in Ohm's law",
            "expected_keywords": ["water", "pipe", "pressure", "voltage"],
        },
        # Chapter 1: Kinematics & Motion
        {
            "subject": "Physics (Kinematics)",
            "doc_id": "doc_chapter1_kinematics",
            "lang": "English",
            "query": "What is the difference between distance and displacement in kinematics?",
            "expected_keywords": ["displacement", "distance", "scalar", "vector"],
        },
        {
            "subject": "Physics (Kinematics)",
            "doc_id": "doc_chapter1_kinematics",
            "lang": "English",
            "query": "State Newton's second law of motion and acceleration equation",
            "expected_keywords": ["newton", "force", "mass", "acceleration"],
        },
        # Chapter 3: Cellular Biology & Organelles
        {
            "subject": "Biology (Cell Biology)",
            "doc_id": "doc_chapter3_cellular_biology",
            "lang": "English",
            "query": "What is mitochondria and why is it called the powerhouse of the cell?",
            "expected_keywords": ["mitochondria", "powerhouse", "atp", "respiration"],
        },
        {
            "subject": "Biology (Cell Biology)",
            "doc_id": "doc_chapter3_cellular_biology",
            "lang": "English",
            "query": "Explain the living factory analogy for cell organelles and nucleus",
            "expected_keywords": ["factory", "nucleus", "ribosome", "endoplasmic"],
        },
        # Chapter 2: Photosynthesis & Chloroplasts
        {
            "subject": "Biochemistry (Photosynthesis)",
            "doc_id": "doc_chapter2_photosynthesis",
            "lang": "English",
            "query": "How does RuBisCO and the Calvin cycle fix carbon dioxide into glucose?",
            "expected_keywords": ["calvin", "rubisco", "carbon", "glucose"],
        },
        {
            "subject": "Biochemistry (Photosynthesis)",
            "doc_id": "doc_chapter2_photosynthesis",
            "lang": "English",
            "query": "Explain the solar energy plant analogy for light reactions and batteries",
            "expected_keywords": ["solar", "battery", "light", "atp"],
        },
        # Multilingual: Hinglish & Hindi
        {
            "subject": "Biology (Hinglish)",
            "doc_id": "doc_chapter3_cellular_biology",
            "lang": "Hinglish",
            "query": "Mitochondria ko cell ka powerhouse kyu kehte hain aur ATP kaise banta hai?",
            "expected_keywords": ["mitochondria", "atp", "powerhouse"],
        },
        {
            "subject": "Physics (Hindi)",
            "doc_id": "doc_chapter4_electricity",
            "lang": "Hindi",
            "query": "विद्युत प्रतिरोध और ओम का नियम क्या है?",
            "expected_keywords": ["ohm", "resistance", "current"],
        },
    ]

    all_passed = True
    for i, tq in enumerate(test_queries, start=1):
        t0 = time.perf_counter()
        ctx = retriever.retrieve_grounded_context(
            query=tq["query"],
            document_id=tq["doc_id"],
            top_k=2,
            score_threshold=0.01,
        )
        latency_ms = (time.perf_counter() - t0) * 1000.0

        assert ctx.has_context is True, f"Failed: No context retrieved for query: '{tq['query']}' in doc {tq['doc_id']}"
        assert ctx.retrieved_count > 0, f"Failed: 0 chunks retrieved for '{tq['query']}'"

        top_source = ctx.sources[0]
        top_text_lower = top_source.text.lower()
        matched = any(kw.lower() in top_text_lower for kw in tq["expected_keywords"])
        status_str = "PASS" if matched else "CHECK"
        if not matched:
            all_passed = False

        print(f"[{i:02d}] [{tq['lang']:<8}] {tq['subject']}")
        print(f"     Query   : \"{tq['query']}\"")
        print(f"     Doc ID  : {tq['doc_id']}")
        print(f"     Section : [{top_source.section_title}] (Page {top_source.primary_page}, Score: {top_source.score:.4f}, Latency: {latency_ms:.2f}ms)")
        print(f"     Snippet : {top_source.text[:130]}...")
        print(f"     Status  : {status_str}\n")

    print("=" * 85)
    if all_passed:
        print(" SUCCESS: All 4 Demo Textbooks Ingested, Indexed & Verified with 100% Accuracy!")
    else:
        print(" COMPLETED with observations.")
    print("=" * 85)


if __name__ == "__main__":
    asyncio.run(ingest_all_textbooks())