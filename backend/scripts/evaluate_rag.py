"""
Standalone Multilingual RAG Retrieval Evaluation Script (Milestone 5).
Benchmarks cross-lingual retrieval accuracy (Hit Rate@1, Hit Rate@3, MRR, Latency)
across English, Hindi (Devanagari), and Hinglish queries against English educational materials.
"""

from __future__ import annotations

import io
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, NamedTuple

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

from app.rag.chunker import DocumentChunk
from app.rag.retriever import RAGRetriever, retrieve_grounded_context
from app.rag.vector_store import VectorStore


class TestCase(NamedTuple):
    query: str
    language: str
    expected_doc_id: str
    expected_chunk_id: str
    concept: str


# Educational Evaluation Documents
EVAL_CHUNKS = [
    # Document 1: Machine Learning
    DocumentChunk(
        chunk_id="chunk_ml_01",
        text="Chapter 1: Supervised machine learning algorithms learn predictive mapping from labeled dataset inputs to outputs.",
        page_numbers=[1],
        primary_page=1,
        section_title="Chapter 1: Supervised Learning",
        chunk_index=0,
        char_count=117,
        token_count=30,
        metadata={"subject": "Machine Learning"},
    ),
    DocumentChunk(
        chunk_id="chunk_ml_02",
        text="Chapter 2: Neural networks and deep learning models optimize multi-layer weights using backpropagation and gradient descent.",
        page_numbers=[2],
        primary_page=2,
        section_title="Chapter 2: Neural Networks & Backpropagation",
        chunk_index=1,
        char_count=127,
        token_count=32,
        metadata={"subject": "Deep Learning"},
    ),
    # Document 2: Neuroscience
    DocumentChunk(
        chunk_id="chunk_neuro_01",
        text="Chapter 1: Neuroplasticity refers to the human brain's capacity to modify neural pathways and reorganize in response to learning.",
        page_numbers=[1],
        primary_page=1,
        section_title="Chapter 1: Neuroplasticity",
        chunk_index=0,
        char_count=133,
        token_count=34,
        metadata={"subject": "Neuroscience"},
    ),
    DocumentChunk(
        chunk_id="chunk_neuro_02",
        text="Chapter 2: Synaptic pruning is the biological process where excess synaptic connections are systematically eliminated to increase brain efficiency.",
        page_numbers=[2],
        primary_page=2,
        section_title="Chapter 2: Synaptic Pruning",
        chunk_index=1,
        char_count=148,
        token_count=37,
        metadata={"subject": "Neuroscience"},
    ),
    # Document 3: Quantum Physics
    DocumentChunk(
        chunk_id="chunk_phys_01",
        text="Chapter 1: Quantum entanglement describes pairs of particles whose quantum states remain correlated regardless of spatial distance.",
        page_numbers=[1],
        primary_page=1,
        section_title="Chapter 1: Quantum Entanglement",
        chunk_index=0,
        char_count=133,
        token_count=34,
        metadata={"subject": "Quantum Physics"},
    ),
]

# Multilingual Evaluation Test Suite
EVAL_TEST_CASES = [
    # Concept 1: Supervised Learning
    TestCase(
        query="What is supervised learning and predictive model training?",
        language="English",
        expected_doc_id="doc_ml",
        expected_chunk_id="chunk_ml_01",
        concept="Supervised Learning",
    ),
    TestCase(
        query="Supervised learning mein model training kaise hoti hai?",
        language="Hinglish",
        expected_doc_id="doc_ml",
        expected_chunk_id="chunk_ml_01",
        concept="Supervised Learning",
    ),
    TestCase(
        query="सुपरवाइज्ड लर्निंग और मॉडल प्रशिक्षण क्या है?",
        language="Hindi",
        expected_doc_id="doc_ml",
        expected_chunk_id="chunk_ml_01",
        concept="Supervised Learning",
    ),

    # Concept 2: Neural Networks & Backpropagation
    TestCase(
        query="How do neural networks optimize weights using backpropagation?",
        language="English",
        expected_doc_id="doc_ml",
        expected_chunk_id="chunk_ml_02",
        concept="Neural Networks",
    ),
    TestCase(
        query="Neural networks mein backpropagation algorithm kaise kaam karta hai?",
        language="Hinglish",
        expected_doc_id="doc_ml",
        expected_chunk_id="chunk_ml_02",
        concept="Neural Networks",
    ),
    TestCase(
        query="तंत्रिका नेटवर्क में बैकप्रॉपैगैशन एल्गोरिदम कैसे काम करता है?",
        language="Hindi",
        expected_doc_id="doc_ml",
        expected_chunk_id="chunk_ml_02",
        concept="Neural Networks",
    ),

    # Concept 3: Neuroplasticity
    TestCase(
        query="Explain neuroplasticity and brain reorganization",
        language="English",
        expected_doc_id="doc_neuro",
        expected_chunk_id="chunk_neuro_01",
        concept="Neuroplasticity",
    ),
    TestCase(
        query="Brain mein neuroplasticity se learning kaise reorganize hoti hai?",
        language="Hinglish",
        expected_doc_id="doc_neuro",
        expected_chunk_id="chunk_neuro_01",
        concept="Neuroplasticity",
    ),
    TestCase(
        query="मानव मस्तिष्क में न्यूरोप्लास्टिसिटी क्या है?",
        language="Hindi",
        expected_doc_id="doc_neuro",
        expected_chunk_id="chunk_neuro_01",
        concept="Neuroplasticity",
    ),

    # Concept 4: Synaptic Pruning
    TestCase(
        query="What is synaptic pruning in the human brain?",
        language="English",
        expected_doc_id="doc_neuro",
        expected_chunk_id="chunk_neuro_02",
        concept="Synaptic Pruning",
    ),
    TestCase(
        query="Synaptic pruning process se brain efficiency kaise badhti hai?",
        language="Hinglish",
        expected_doc_id="doc_neuro",
        expected_chunk_id="chunk_neuro_02",
        concept="Synaptic Pruning",
    ),
    TestCase(
        query="मस्तिष्क में सिनैप्टिक प्रूनिंग प्रक्रिया कैसे होती है?",
        language="Hindi",
        expected_doc_id="doc_neuro",
        expected_chunk_id="chunk_neuro_02",
        concept="Synaptic Pruning",
    ),

    # Concept 5: Quantum Entanglement
    TestCase(
        query="How does quantum entanglement link particle states?",
        language="English",
        expected_doc_id="doc_phys",
        expected_chunk_id="chunk_phys_01",
        concept="Quantum Entanglement",
    ),
    TestCase(
        query="Quantum physics mein particle entanglement ka matlab kya hai?",
        language="Hinglish",
        expected_doc_id="doc_phys",
        expected_chunk_id="chunk_phys_01",
        concept="Quantum Entanglement",
    ),
    TestCase(
        query="भौतिकी में क्वांटम एंटैंगलमेंट क्या है?",
        language="Hindi",
        expected_doc_id="doc_phys",
        expected_chunk_id="chunk_phys_01",
        concept="Quantum Entanglement",
    ),
]


def run_evaluation(persist_dir: str = "./.eval_chroma_db") -> Dict[str, Any]:
    """Sets up evaluation store, executes queries across all languages, and prints metrics."""
    store = VectorStore(persist_directory=persist_dir)
    store.clear()

    # Index evaluation documents
    store.store_chunks(document_id="doc_ml", chunks=[EVAL_CHUNKS[0], EVAL_CHUNKS[1]])
    store.store_chunks(document_id="doc_neuro", chunks=[EVAL_CHUNKS[2], EVAL_CHUNKS[3]])
    store.store_chunks(document_id="doc_phys", chunks=[EVAL_CHUNKS[4]])

    retriever = RAGRetriever(vector_store=store, default_top_k=3, default_score_threshold=0.01)

    print("=" * 88)
    print("      VIRTUAL HAWKS AI TEACHER - MULTILINGUAL RAG EVALUATION BENCHMARK      ")
    print("=" * 88)
    print(f"Total Evaluation Test Cases: {len(EVAL_TEST_CASES)}")
    print(f"Supported Languages: English, Hindi (Devanagari), Hinglish (Romanized Hindi)\n")

    header_fmt = "{:<3} | {:<9} | {:<22} | {:<16} | {:<16} | {:<6} | {:<6} | {:<8}"
    print(header_fmt.format("#", "Language", "Concept", "Target Chunk", "Top Retrieved", "Hit@1", "Hit@3", "Latency"))
    print("-" * 105)

    hit_at_1_count = 0
    hit_at_3_count = 0
    reciprocal_ranks: List[float] = []
    latencies_ms: List[float] = []
    lang_stats: Dict[str, Dict[str, Any]] = {
        "English": {"total": 0, "hit1": 0, "hit3": 0, "mrr_sum": 0.0, "latency_sum": 0.0},
        "Hindi": {"total": 0, "hit1": 0, "hit3": 0, "mrr_sum": 0.0, "latency_sum": 0.0},
        "Hinglish": {"total": 0, "hit1": 0, "hit3": 0, "mrr_sum": 0.0, "latency_sum": 0.0},
    }

    for idx, tc in enumerate(EVAL_TEST_CASES, start=1):
        t0 = time.perf_counter()
        context = retriever.retrieve_grounded_context(
            query=tc.query,
            document_id=tc.expected_doc_id,
            top_k=3,
            score_threshold=0.01,
        )
        latency_ms = (time.perf_counter() - t0) * 1000.0
        latencies_ms.append(latency_ms)

        retrieved_ids = [s.chunk_id for s in context.sources]
        top_retrieved = retrieved_ids[0] if retrieved_ids else "None"

        hit1 = 1 if (len(retrieved_ids) > 0 and retrieved_ids[0] == tc.expected_chunk_id) else 0
        hit3 = 1 if (tc.expected_chunk_id in retrieved_ids[:3]) else 0

        # Calculate reciprocal rank
        rr = 0.0
        if tc.expected_chunk_id in retrieved_ids:
            rank = retrieved_ids.index(tc.expected_chunk_id) + 1
            rr = 1.0 / rank

        hit_at_1_count += hit1
        hit_at_3_count += hit3
        reciprocal_ranks.append(rr)

        # Update language breakdown
        l_stat = lang_stats[tc.language]
        l_stat["total"] += 1
        l_stat["hit1"] += hit1
        l_stat["hit3"] += hit3
        l_stat["mrr_sum"] += rr
        l_stat["latency_sum"] += latency_ms

        print(
            header_fmt.format(
                idx,
                tc.language,
                tc.concept[:22],
                tc.expected_chunk_id,
                top_retrieved,
                "PASS" if hit1 else "FAIL",
                "PASS" if hit3 else "FAIL",
                f"{latency_ms:.2f}ms",
            )
        )

    # Summary Metrics
    total_q = len(EVAL_TEST_CASES)
    overall_hit1 = (hit_at_1_count / total_q) * 100.0
    overall_hit3 = (hit_at_3_count / total_q) * 100.0
    overall_mrr = sum(reciprocal_ranks) / total_q
    avg_latency = sum(latencies_ms) / total_q

    print("=" * 105)
    print("                               OVERALL BENCHMARK RESULTS                             ")
    print("=" * 105)
    print(f"• Overall Hit Rate@1: {overall_hit1:.1f}% ({hit_at_1_count}/{total_q})")
    print(f"• Overall Hit Rate@3: {overall_hit3:.1f}% ({hit_at_3_count}/{total_q})")
    print(f"• Mean Reciprocal Rank (MRR): {overall_mrr:.4f}")
    print(f"• Average Retrieval Latency: {avg_latency:.2f} ms")
    print("\n--- Language Modality Breakdown ---")
    for lang, st in lang_stats.items():
        if st["total"] > 0:
            h1_pct = (st["hit1"] / st["total"]) * 100.0
            h3_pct = (st["hit3"] / st["total"]) * 100.0
            mrr_val = st["mrr_sum"] / st["total"]
            lat_val = st["latency_sum"] / st["total"]
            print(
                f"  [{lang:<8}] Hit@1: {h1_pct:5.1f}% | Hit@3: {h3_pct:5.1f}% | MRR: {mrr_val:.4f} | Avg Latency: {lat_val:.2f}ms"
            )
    print("=" * 105)

    return {
        "total_queries": total_q,
        "hit_at_1_pct": overall_hit1,
        "hit_at_3_pct": overall_hit3,
        "mrr": overall_mrr,
        "avg_latency_ms": avg_latency,
        "language_breakdown": lang_stats,
    }


if __name__ == "__main__":
    run_evaluation()