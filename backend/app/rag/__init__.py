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
from app.rag.exceptions import (
    ChunkingError,
    CorruptedFileError,
    DocumentProcessingError,
    EmptyDocumentError,
    FileAccessError,
    UnsupportedFileTypeError,
)

__all__ = [
    "DocumentProcessor",
    "DocumentPage",
    "ProcessedDocument",
    "SemanticChunker",
    "DocumentChunk",
    "ChunkedDocument",
    "DocumentProcessingError",
    "UnsupportedFileTypeError",
    "CorruptedFileError",
    "EmptyDocumentError",
    "FileAccessError",
    "ChunkingError",
]