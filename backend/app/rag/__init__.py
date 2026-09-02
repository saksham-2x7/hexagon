"""
RAG (Retrieval-Augmented Generation) package for Virtual Hawks AI Teacher.
"""

from app.rag.document_processor import (
    DocumentPage,
    DocumentProcessor,
    ProcessedDocument,
)
from app.rag.chunker import (
    ChunkedDocument,
    DocumentChunk,
    SemanticChunker,
)
from app.rag.vector_store import (
    LocalDenseEmbeddingEngine,
    QueryResult,
    VectorStore,
)
from app.rag.exceptions import (
    ChunkingError,
    CorruptedFileError,
    DocumentProcessingError,
    EmbeddingError,
    EmptyDocumentError,
    FileAccessError,
    UnsupportedFileTypeError,
    VectorStoreError,
)

__all__ = [
    "DocumentProcessor",
    "DocumentPage",
    "ProcessedDocument",
    "SemanticChunker",
    "DocumentChunk",
    "ChunkedDocument",
    "VectorStore",
    "LocalDenseEmbeddingEngine",
    "QueryResult",
    "DocumentProcessingError",
    "UnsupportedFileTypeError",
    "CorruptedFileError",
    "EmptyDocumentError",
    "FileAccessError",
    "ChunkingError",
    "VectorStoreError",
    "EmbeddingError",
]