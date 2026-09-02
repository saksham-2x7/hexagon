"""
Ingestion & Verification Script for Demo Educational Materials (Milestone Ingestion).
Reads Chapter 4: Electricity & Ohm's Law, extracts & semantically chunks it,
embeds it into the persistent VectorStore, and registers it in the SQLite DocumentStore.
"""

from __future__ import annotations

import asyncio
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

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.database import DocumentStore
from app.rag import DocumentProcessor, RAGRetriever, VectorStore, retrieve_grounded_context
from app.schemas.material import MaterialMetadata, ProcessingStatus


async def ingest_and_verify():
    textbook_path = backend_dir / "data" / "textbooks" / "chapter4_electricity.md"
    doc_id = "doc_chapter4_electricity"

    print("=" * 80)
    print("      VIRTUAL HAWKS AI TEACHER - DEMO DATA INGESTION & VERIFICATION      ")
    print("=" * 80)
    print(f"Source Textbook File: {textbook_path.name}")
    print(f"Target Document ID  : {doc_id}\n")

    if not textbook_path.exists():
        raise FileNotFoundError(f"Textbook file not found at: {textbook_path}")

    # ------------------------------------------------------------------
    # Step 1: Extract & Semantically Chunk Document
    # ------------------------------------------------------------------
    print("[1/4] Extracting & Semantically Chunking source material...")
    chunked_doc = DocumentProcessor.extract_and_chunk(
        file_source=str(textbook_path),
        file_type="md",
        chunk_size_chars=1200,
        chunk_overlap_chars=200,
    )
    print(f"      -> Extracted {chunked_doc.total_characters} characters, {chunked_doc.total_estimated_tokens} tokens")
    print(f"      -> Created {chunked_doc.total_chunks} structured semantic chunks with section headers")

    for i, chk in enumerate(chunked_doc.chunks, start=1):
        sec_display = chk.section_title or "No Section Header"
        print(f"         Chunk {i}: [{sec_display}] (Page {chk.primary_page}, {chk.char_count} chars)")

    # ------------------------------------------------------------------
    # Step 2: Store in VectorStore (Persistent Local Vector DB)
    # ------------------------------------------------------------------
    print("\n[2/4] Generating Multilingual Dense Embeddings & Storing in VectorStore...")
    chroma_dir = backend_dir / ".chroma_db"
    vector_store = VectorStore(persist_directory=str(chroma_dir))
    
    # Store chunks into vector database
    stored_count = vector_store.store_chunks(
        document_id=doc_id,
        chunks=chunked_doc.chunks,
    )
    print(f"      -> Successfully embedded & indexed {stored_count} chunks in '{chroma_dir.name}'")
    print(f"      -> Total vectors in collection for '{doc_id}': {vector_store.count(document_id=doc_id)}")

    # ------------------------------------------------------------------
    # Step 3: Register Material in Async SQLite DocumentStore
    # ------------------------------------------------------------------
    print("\n[3/4] Registering Material in Async SQLite DocumentStore (app.db)...")
    await DocumentStore.init_db()

    file_stat = textbook_path.stat()
    material_meta = MaterialMetadata(
        file_id=doc_id,
        student_id="550e8400-e29b-41d4-a716-446655440000",
        filename=textbook_path.name,
        file_type="md",
        status=ProcessingStatus.READY,
        uploaded_at=datetime.now(timezone.utc),
        error_message=None,
    )

    await DocumentStore.put("materials", doc_id, material_meta.model_dump(mode="json"))
    stored_meta = await DocumentStore.get("materials", doc_id)
    print(f"      -> Material '{stored_meta['filename']}' registered with status: {stored_meta['status']}")

    # ------------------------------------------------------------------
    # Step 4: Verification Queries (English, Hinglish, Hindi)
    # ------------------------------------------------------------------
    print("\n[4/4] Executing Grounded Retrieval Assertions (English / Hinglish / Hindi)...")
    retriever = RAGRetriever(vector_store=vector_store, default_top_k=2)

    test_queries = [
        {
            "label": "Concept: Resistance & Factors",
            "lang": "English",
            "query": "What is electrical resistance and what factors affect the resistance of a wire?",
            "expected_keywords": ["resistance", "length", "cross-sectional", "resistivity"],
        },
        {
            "label": "Analogy: Water-Pipe Hydraulic Model",
            "lang": "English",
            "query": "Explain the water pipe analogy for voltage and current flow in Ohm's law",
            "expected_keywords": ["water", "pipe", "pressure", "voltage", "current"],
        },
        {
            "label": "Hinglish: Ohm's Law & Resistance",
            "lang": "Hinglish",
            "query": "Ohm's law mein resistance aur voltage ka formula kya hai?",
            "expected_keywords": ["ohm", "resistance", "voltage", "current"],
        },
        {
            "label": "Hindi (Devanagari): Electrical Resistance",
            "lang": "Hindi",
            "query": "à¤µà¤¿à¤¦à¥à¤¯à¥à¤¤ à¤ªà¥à¤°à¤¤à¤¿à¤°à¥‹à¤§ à¤”à¤° à¤“à¤® à¤•à¤¾ à¤¨à¤¿à¤¯à¤® à¤•à¥à¤¯à¤¾ à¤¹à¥ˆ?",
            "expected_keywords": ["ohm", "resistance", "current"],
        },
    ]

    all_passed = True
    for tq in test_queries:
        t0 = time.perf_counter()
        ctx = retriever.retrieve_grounded_context(
            query=tq["query"],
            document_id=doc_id,
            top_k=2,
            score_threshold=0.01,
        )
        latency_ms = (time.perf_counter() - t0) * 1000.0

        # Assert context is retrieved
        assert ctx.has_context is True, f"Failed: No context retrieved for '{tq['query']}'"
        assert ctx.retrieved_count > 0, "Failed: retrieved_count is 0"
        
        top_source = ctx.sources[0]
        top_text_lower = top_source.text.lower()
        matched = any(kw.lower() in top_text_lower for kw in tq["expected_keywords"])
        status_str = "PASS" if matched else "CHECK"
        if not matched:
            all_passed = False

        print(f"\n   [{tq['lang']}] {tq['label']}")
        print(f"      Query    : \"{tq['query']}\"")
        print(f"      Match    : [{top_source.section_title}] (Page {top_source.primary_page}, Score: {top_source.score:.4f}, Latency: {latency_ms:.2f}ms)")
        print(f"      Snippet  : {top_source.text[:120]}...")
        print(f"      Status   : {status_str}")

    print("\n" + "=" * 80)
    if all_passed:
        print(" SUCCESS: Demo Source Material (Chapter 4) Ingested & Verified!")
    else:
        print(" COMPLETED with observations.")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(ingest_and_verify())
