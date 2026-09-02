"""
Custom domain exceptions for document processing and text extraction in the RAG pipeline.
"""

class DocumentProcessingError(Exception):
    """Base exception for all document processing errors."""
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