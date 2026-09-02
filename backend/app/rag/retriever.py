"""
RAG Retrieval Engine & Grounded Context Formatting Module.
Performs semantic retrieval against the local vector store and structures top-matching
chunks with source citations for LLM prompt context injection (Milestone 4).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from app.rag.exceptions import RetrievalError
from app.rag.vector_store import QueryResult, VectorStore


@dataclass
class GroundedSource:
    """Detailed metadata and text for a single retrieved chunk."""
    chunk_id: str
    document_id: str
    primary_page: int
    page_numbers: List[int]
    section_title: Optional[str]
    score: float
    text: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert GroundedSource to JSON-serializable dictionary."""
        return {
            "chunk_id": self.chunk_id,
            "document_id": self.document_id,
            "primary_page": self.primary_page,
            "page_numbers": self.page_numbers,
            "section_title": self.section_title,
            "score": round(self.score, 4),
            "text": self.text,
            "metadata": self.metadata,
        }


@dataclass
class GroundedContext:
    """
    Prompt-ready grounded context output.
    Contains clean formatted context text with source headers and structured source metadata.
    """
    query: str
    document_id: str
    formatted_context_text: str
    sources: List[GroundedSource]
    retrieved_count: int
    has_context: bool
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert GroundedContext to JSON-serializable dictionary."""
        return {
            "query": self.query,
            "document_id": self.document_id,
            "formatted_context_text": self.formatted_context_text,
            "sources": [s.to_dict() for s in self.sources],
            "retrieved_count": self.retrieved_count,
            "has_context": self.has_context,
            "metadata": self.metadata,
        }


class RAGRetriever:
    """
    RAG Retrieval Engine that queries persistent vector storage and formats
    grounded educational context with explicit citations.
    """

    def __init__(
        self,
        vector_store: Optional[VectorStore] = None,
        default_top_k: int = 4,
        default_score_threshold: float = 0.05,
        persist_directory: Union[str, Path] = "./.chroma_db",
    ):
        """
        Initialize the RAGRetriever.

        Args:
            vector_store: Optional pre-configured VectorStore instance.
            default_top_k: Default number of chunks to retrieve (default: 4).
            default_score_threshold: Minimum similarity score threshold (default: 0.05).
            persist_directory: Storage directory if vector_store is initialized automatically.
        """
        self.default_top_k = default_top_k
        self.default_score_threshold = default_score_threshold

        if vector_store is not None:
            self.vector_store = vector_store
        else:
            self.vector_store = VectorStore(persist_directory=persist_directory)

    @staticmethod
    def format_source_header(
        primary_page: int,
        page_numbers: List[int],
        section_title: Optional[str],
        document_id: str,
    ) -> str:
        """Constructs a clean, human-readable source header for prompt demarcation."""
        if len(page_numbers) > 1:
            page_str = f"Pages {', '.join(str(p) for p in page_numbers)}"
        else:
            page_str = f"Page {primary_page}"

        parts = [f"Source: {page_str}"]
        if section_title and section_title.strip():
            parts.append(f"Section: {section_title.strip()}")
        parts.append(f"Document: {document_id}")

        return f"--- [{ ' | '.join(parts) }] ---"

    def retrieve_grounded_context(
        self,
        query: str,
        document_id: str,
        top_k: Optional[int] = None,
        score_threshold: Optional[float] = None,
        collection_name: Optional[str] = None,
    ) -> GroundedContext:
        """
        Retrieves top relevant chunks for a learner's query and formats a prompt-ready context string.

        Args:
            query: The learner's question or topic concept to explain.
            document_id: Unique identifier for the material to search within.
            top_k: Number of top chunks to retrieve (default: 4).
            score_threshold: Minimum cosine similarity score threshold (default: 0.05).
            collection_name: Optional collection namespace filter.

        Returns:
            GroundedContext with structured source citations and formatted text.
        """
        clean_query = (query or "").strip()
        clean_doc_id = (document_id or "").strip()
        k = top_k if (top_k is not None and top_k > 0) else self.default_top_k
        threshold = (
            score_threshold
            if (score_threshold is not None and score_threshold >= 0.0)
            else self.default_score_threshold
        )

        # Handle empty inputs gracefully
        if not clean_query or not clean_doc_id:
            return GroundedContext(
                query=clean_query,
                document_id=clean_doc_id,
                formatted_context_text="No relevant context found in uploaded materials.",
                sources=[],
                retrieved_count=0,
                has_context=False,
                metadata={"reason": "empty_query_or_document_id"},
            )

        try:
            # 1. Query persistent vector store
            query_results = self.vector_store.query(
                query_text=clean_query,
                document_id=clean_doc_id,
                top_k=k,
                collection_name=collection_name,
                min_score=threshold,
            )

            if not query_results:
                return GroundedContext(
                    query=clean_query,
                    document_id=clean_doc_id,
                    formatted_context_text="No relevant context found in uploaded materials.",
                    sources=[],
                    retrieved_count=0,
                    has_context=False,
                    metadata={"reason": "no_chunks_above_threshold", "score_threshold": threshold},
                )

            # 2. Build structured GroundedSource models and format prompt blocks
            sources: List[GroundedSource] = []
            formatted_blocks: List[str] = []

            for res in query_results:
                source_obj = GroundedSource(
                    chunk_id=res.chunk_id,
                    document_id=res.document_id,
                    primary_page=res.primary_page,
                    page_numbers=res.page_numbers,
                    section_title=res.section_title,
                    score=res.score,
                    text=res.text,
                    metadata=res.metadata,
                )
                sources.append(source_obj)

                header = self.format_source_header(
                    primary_page=res.primary_page,
                    page_numbers=res.page_numbers,
                    section_title=res.section_title,
                    document_id=res.document_id,
                )
                formatted_blocks.append(f"{header}\n{res.text}")

            full_formatted_text = "\n\n".join(formatted_blocks)

            return GroundedContext(
                query=clean_query,
                document_id=clean_doc_id,
                formatted_context_text=full_formatted_text,
                sources=sources,
                retrieved_count=len(sources),
                has_context=True,
                metadata={
                    "top_k": k,
                    "score_threshold": threshold,
                    "retrieved_at": datetime.now(timezone.utc).isoformat(),
                },
            )

        except Exception as e:
            raise RetrievalError(
                f"Failed to retrieve grounded context for query '{clean_query}' on document '{clean_doc_id}': {str(e)}"
            ) from e


def retrieve_grounded_context(
    query: str,
    document_id: str,
    top_k: int = 4,
    score_threshold: Optional[float] = None,
    vector_store: Optional[VectorStore] = None,
    persist_directory: Union[str, Path] = "./.chroma_db",
) -> GroundedContext:
    """
    Convenience function to perform grounded context retrieval in a single function call.
    """
    retriever = RAGRetriever(
        vector_store=vector_store,
        default_top_k=top_k,
        default_score_threshold=score_threshold if score_threshold is not None else 0.05,
        persist_directory=persist_directory,
    )
    return retriever.retrieve_grounded_context(
        query=query,
        document_id=document_id,
        top_k=top_k,
        score_threshold=score_threshold,
    )