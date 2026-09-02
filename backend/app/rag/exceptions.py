"""
Custom domain exceptions for document processing, text extraction, and chunking in the RAG pipeline.
"""

class DocumentProcessingError(Exception):
    """Base exception for all document processing and RAG errors."""
    pass


class UnsupportedFileTypeError(DocumentProcessingError):
    """Raised when an uploaded or specified file format is not supported."""
    pass


class CorruptedFileError(DocumentProcessingError):
    """Raised when a document is damaged, malformed, or cannot be parsed."""
    pass


class EmptyDocumentError(DocumentProcessingError):
    """Raised when a document contains no extractable text or is 0 bytes."""
    pass


class FileAccessError(DocumentProcessingError):
    """Raised when a file cannot be found, accessed, or read from disk/stream."""
    pass


class ChunkingError(DocumentProcessingError):
    """Raised when an error occurs during document chunking or metadata splitting."""
    pass