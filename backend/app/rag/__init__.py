"""
RAG (Retrieval-Augmented Generation) package for Virtual Hawks AI Teacher.
"""

from app.rag.document_processor import (
    DocumentPage,
    DocumentProcessor,
    ProcessedDocument,
)
from app.rag.exceptions import (
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
    "DocumentProcessingError",
    "UnsupportedFileTypeError",
    "CorruptedFileError",
    "EmptyDocumentError",
    "FileAccessError",
]