"""
Semantic Chunking & Educational Metadata Module.
Splits extracted document pages into semantically cohesive, page-aware chunks
enriched with chapter/section headers and token counts for RAG retrieval.
"""

from __future__ import annotations

import hashlib
import math
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence, Tuple, Union

from app.rag.document_processor import DocumentPage, ProcessedDocument
from app.rag.exceptions import ChunkingError


@dataclass
class DocumentChunk:
    """Represents an individual text chunk with structural and educational metadata."""
    chunk_id: str
    text: str
    page_numbers: List[int]
    primary_page: int
    section_title: Optional[str]
    chunk_index: int
    char_count: int
    token_count: int
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert chunk object to JSON-serializable dictionary."""
        return {
            "chunk_id": self.chunk_id,
            "text": self.text,
            "page_numbers": self.page_numbers,
            "primary_page": self.primary_page,
            "section_title": self.section_title,
            "chunk_index": self.chunk_index,
            "char_count": self.char_count,
            "token_count": self.token_count,
            "metadata": self.metadata,
        }


@dataclass
class ChunkedDocument:
    """Represents the complete chunked output of a processed document."""
    file_name: Optional[str]
    file_type: str
    total_chunks: int
    total_characters: int
    total_estimated_tokens: int
    chunks: List[DocumentChunk]
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert chunked document to JSON-serializable dictionary."""
        return {
            "file_name": self.file_name,
            "file_type": self.file_type,
            "total_chunks": self.total_chunks,
            "total_characters": self.total_characters,
            "total_estimated_tokens": self.total_estimated_tokens,
            "chunks": [chunk.to_dict() for chunk in self.chunks],
            "metadata": self.metadata,
        }


class SemanticChunker:
    """
    Modular semantic chunker tailored for educational documents.
    Performs recursive boundary-aware splitting while tracking page numbers,
    chapter/section titles, and token estimates.
    """

    # Educational & Document Heading Patterns
    HEADING_PATTERNS = [
        # Markdown headings: # Title, ## Section
        re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE),
        # Chapter / Module / Unit / Lesson / Lecture / Topic headings
        re.compile(
            r"^(?:Chapter|Module|Unit|Lesson|Lecture|Topic|Part|Section)\s+[\dIVXLCDM]+[:\s\-\.]*(.+)$",
            re.IGNORECASE | re.MULTILINE,
        ),
        # Numbered headings: 1. Introduction, 2.1 Backprop
        re.compile(r"^(\d+(?:\.\d+)+)\s+([A-Z].+)$", re.MULTILINE),
    ]

    def __init__(
        self,
        chunk_size_chars: int = 1800,
        chunk_overlap_chars: int = 250,
        min_chunk_size_chars: int = 80,
        token_estimation_ratio: float = 4.0,
    ):
        """
        Initialize the SemanticChunker.

        Args:
            chunk_size_chars: Maximum target size per chunk in characters (~450 tokens).
            chunk_overlap_chars: Target character overlap between consecutive chunks (~10-15%).
            min_chunk_size_chars: Minimum threshold to prevent tiny orphan fragments.
            token_estimation_ratio: Average characters per token (default: 4.0).
        """
        if chunk_size_chars <= 0:
            raise ValueError("chunk_size_chars must be greater than 0")
        if chunk_overlap_chars < 0:
            raise ValueError("chunk_overlap_chars cannot be negative")
        if chunk_overlap_chars >= chunk_size_chars:
            raise ValueError("chunk_overlap_chars must be strictly less than chunk_size_chars")

        self.chunk_size_chars = chunk_size_chars
        self.chunk_overlap_chars = chunk_overlap_chars
        self.min_chunk_size_chars = min_chunk_size_chars
        self.token_estimation_ratio = token_estimation_ratio

    def estimate_tokens(self, text: str) -> int:
        """Estimates token count from text using character heuristic."""
        if not text:
            return 0
        return max(1, math.ceil(len(text) / self.token_estimation_ratio))

    def detect_heading(self, line: str) -> Optional[str]:
        """Detects whether a single line of text is a section/chapter heading."""
        cleaned_line = line.strip()
        if not cleaned_line or len(cleaned_line) > 120:
            return None

        # Check Markdown headers
        if cleaned_line.startswith("#"):
            match = re.match(r"^#{1,6}\s+(.+)$", cleaned_line)
            if match:
                return match.group(1).strip()

        # Check Chapter / Module / Unit / Lesson
        for pattern in self.HEADING_PATTERNS:
            match = pattern.match(cleaned_line)
            if match:
                # Return the full clean heading line
                return cleaned_line.strip("#* ").strip()

        # Check short all-caps lines with colon or title style (e.g. "LEARNING OBJECTIVES:")
        if (
            len(cleaned_line) >= 4
            and len(cleaned_line) <= 50
            and cleaned_line.isupper()
            and not cleaned_line.endswith((".", "?", "!"))
        ):
            return cleaned_line.rstrip(":")

        return None

    def _generate_chunk_id(
        self,
        file_name: Optional[str],
        chunk_index: int,
        primary_page: int,
        text_sample: str,
    ) -> str:
        """Generates a deterministic unique chunk ID."""
        raw_key = f"{file_name or 'doc'}:p{primary_page}:c{chunk_index}:{text_sample[:40]}"
        digest = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()[:16]
        prefix = re.sub(r"[^a-zA-Z0-9_-]", "_", file_name or "chunk")[:12]
        return f"{prefix}_p{primary_page}_c{chunk_index}_{digest}"

    def chunk_document(
        self,
        document: Union[ProcessedDocument, str, List[DocumentPage], Dict[str, Any]],
        file_name: Optional[str] = None,
        file_type: Optional[str] = None,
        extra_metadata: Optional[Dict[str, Any]] = None,
    ) -> ChunkedDocument:
        """
        Transforms a ProcessedDocument or page list into structured DocumentChunks.

        Args:
            document: ProcessedDocument instance, list of DocumentPages, dictionary, or raw string.
            file_name: Optional override file name.
            file_type: Optional override file type.
            extra_metadata: Optional additional metadata to attach to all chunks.

        Returns:
            ChunkedDocument containing structured chunks and summary metrics.
        """
        try:
            pages, inferred_name, inferred_type, doc_meta = self._normalize_input(
                document, file_name, file_type
            )

            if extra_metadata:
                doc_meta.update(extra_metadata)

            if not pages:
                return ChunkedDocument(
                    file_name=inferred_name,
                    file_type=inferred_type,
                    total_chunks=0,
                    total_characters=0,
                    total_estimated_tokens=0,
                    chunks=[],
                    metadata=doc_meta,
                )

            # Step 1: Extract atomic semantic units (paragraphs/blocks) with page & heading tags
            tagged_blocks = self._extract_tagged_blocks(pages)

            # Step 2: Assemble semantic blocks into chunk windows with overlap
            chunks = self._assemble_chunks(tagged_blocks, inferred_name, doc_meta)

            total_chars = sum(c.char_count for c in chunks)
            total_tokens = sum(c.token_count for c in chunks)

            summary_meta = {
                **doc_meta,
                "chunker_params": {
                    "chunk_size_chars": self.chunk_size_chars,
                    "chunk_overlap_chars": self.chunk_overlap_chars,
                    "min_chunk_size_chars": self.min_chunk_size_chars,
                },
                "chunked_at": datetime.now(timezone.utc).isoformat(),
            }

            return ChunkedDocument(
                file_name=inferred_name,
                file_type=inferred_type,
                total_chunks=len(chunks),
                total_characters=total_chars,
                total_estimated_tokens=total_tokens,
                chunks=chunks,
                metadata=summary_meta,
            )

        except Exception as e:
            if isinstance(e, ChunkingError):
                raise
            raise ChunkingError(f"Failed to chunk document: {str(e)}") from e

    def _normalize_input(
        self,
        document: Union[ProcessedDocument, str, List[DocumentPage], Dict[str, Any]],
        file_name: Optional[str],
        file_type: Optional[str],
    ) -> Tuple[List[DocumentPage], Optional[str], str, Dict[str, Any]]:
        """Normalizes various document input formats into standard DocumentPage list."""
        if isinstance(document, ProcessedDocument):
            name = file_name or document.file_name
            ft = file_type or document.file_type
            return document.pages, name, ft, dict(document.metadata)

        if isinstance(document, str):
            doc_page = DocumentPage(page_number=1, text=document, metadata={})
            return [doc_page], file_name, file_type or "txt", {}

        if isinstance(document, list):
            pages: List[DocumentPage] = []
            for item in document:
                if isinstance(item, DocumentPage):
                    pages.append(item)
                elif isinstance(item, dict):
                    pages.append(
                        DocumentPage(
                            page_number=item.get("page_number", 1),
                            text=item.get("text", ""),
                            metadata=item.get("metadata", {}),
                        )
                    )
            return pages, file_name, file_type or "unknown", {}

        if isinstance(document, dict):
            pages_data = document.get("pages", [])
            pages = []
            for p in pages_data:
                if isinstance(p, dict):
                    pages.append(
                        DocumentPage(
                            page_number=p.get("page_number", 1),
                            text=p.get("text", ""),
                            metadata=p.get("metadata", {}),
                        )
                    )
            name = file_name or document.get("file_name")
            ft = file_type or document.get("file_type", "unknown")
            meta = document.get("metadata", {})
            return pages, name, ft, meta

        raise ChunkingError(f"Unsupported document input type: {type(document).__name__}")

    def _extract_tagged_blocks(
        self, pages: List[DocumentPage]
    ) -> List[Dict[str, Any]]:
        """
        Extracts paragraphs and segments from pages, associating each block with
        its source page number and the prevailing section title.
        """
        tagged_blocks: List[Dict[str, Any]] = []
        current_section: Optional[str] = None

        for page in pages:
            page_num = page.page_number
            page_text = page.text or ""
            if not page_text.strip():
                continue

            # Split into paragraphs by double newlines or single newlines with markdown/headings
            paragraphs = re.split(r"\n\s*\n", page_text)

            for para in paragraphs:
                para_clean = para.strip()
                if not para_clean:
                    continue

                # Check if this paragraph or its first line is a heading
                first_line = para_clean.split("\n")[0].strip()
                detected = self.detect_heading(first_line)
                if detected:
                    current_section = detected

                # If paragraph itself is excessively large, split recursively into sentences
                if len(para_clean) > self.chunk_size_chars:
                    sub_sentences = self._split_large_paragraph(para_clean)
                    for sent in sub_sentences:
                        sent_clean = sent.strip()
                        if sent_clean:
                            tagged_blocks.append({
                                "text": sent_clean,
                                "page_number": page_num,
                                "section_title": current_section,
                            })
                else:
                    tagged_blocks.append({
                        "text": para_clean,
                        "page_number": page_num,
                        "section_title": current_section,
                    })

        return tagged_blocks

    def _split_large_paragraph(self, text: str) -> List[str]:
        """Splits an oversized paragraph into sentence or word-level units."""
        # Split on sentences (. ! ? followed by space) or newlines
        sentences = re.split(r"(?<=[.!?])\s+", text)
        results: List[str] = []

        for sent in sentences:
            sent_str = sent.strip()
            if not sent_str:
                continue

            # If a single sentence is still larger than chunk_size, split by word chunks
            if len(sent_str) > self.chunk_size_chars:
                words = sent_str.split()
                current_word_buf: List[str] = []
                current_len = 0
                for w in words:
                    if current_len + len(w) + 1 > self.chunk_size_chars and current_word_buf:
                        results.append(" ".join(current_word_buf))
                        current_word_buf = [w]
                        current_len = len(w)
                    else:
                        current_word_buf.append(w)
                        current_len += len(w) + 1
                if current_word_buf:
                    results.append(" ".join(current_word_buf))
            else:
                results.append(sent_str)

        return results

    def _assemble_chunks(
        self,
        tagged_blocks: List[Dict[str, Any]],
        file_name: Optional[str],
        doc_meta: Dict[str, Any],
    ) -> List[DocumentChunk]:
        """
        Assembles tagged blocks into overlapping chunk windows while preserving
        page numbers, section headings, and character bounds.
        """
        if not tagged_blocks:
            return []

        chunks: List[DocumentChunk] = []
        current_blocks: List[Dict[str, Any]] = []
        current_len = 0
        chunk_idx = 0

        i = 0
        while i < len(tagged_blocks):
            block = tagged_blocks[i]
            block_len = len(block["text"])

            # If adding this block exceeds target size and we already have accumulated text:
            if current_len + block_len + 2 > self.chunk_size_chars and current_blocks:
                # Emit current accumulated chunk
                chunk_obj = self._create_chunk_from_blocks(
                    current_blocks, chunk_idx, file_name, doc_meta
                )
                chunks.append(chunk_obj)
                chunk_idx += 1

                # Calculate overlap: retain trailing blocks that fit within chunk_overlap_chars
                overlap_blocks: List[Dict[str, Any]] = []
                overlap_len = 0
                for b in reversed(current_blocks):
                    if overlap_len + len(b["text"]) + 2 <= self.chunk_overlap_chars:
                        overlap_blocks.insert(0, b)
                        overlap_len += len(b["text"]) + 2
                    else:
                        break

                current_blocks = list(overlap_blocks)
                current_len = sum(len(b["text"]) + 2 for b in current_blocks)

            current_blocks.append(block)
            current_len += block_len + 2
            i += 1

        # Emit any remaining blocks
        if current_blocks:
            # If the remaining block is tiny and we have previous chunks, merge if feasible
            chunk_obj = self._create_chunk_from_blocks(
                current_blocks, chunk_idx, file_name, doc_meta
            )
            
            if (
                chunks
                and chunk_obj.char_count < self.min_chunk_size_chars
                and (chunks[-1].char_count + chunk_obj.char_count + 2 <= self.chunk_size_chars + self.chunk_overlap_chars)
            ):
                # Merge tiny trailing fragment with the last chunk
                last = chunks[-1]
                merged_text = f"{last.text}\n\n{chunk_obj.text}"
                merged_pages = sorted(list(set(last.page_numbers + chunk_obj.page_numbers)))
                chunks[-1] = DocumentChunk(
                    chunk_id=last.chunk_id,
                    text=merged_text,
                    page_numbers=merged_pages,
                    primary_page=last.primary_page,
                    section_title=last.section_title or chunk_obj.section_title,
                    chunk_index=last.chunk_index,
                    char_count=len(merged_text),
                    token_count=self.estimate_tokens(merged_text),
                    metadata=last.metadata,
                )
            else:
                chunks.append(chunk_obj)

        return chunks

    def _create_chunk_from_blocks(
        self,
        blocks: List[Dict[str, Any]],
        chunk_index: int,
        file_name: Optional[str],
        doc_meta: Dict[str, Any],
    ) -> DocumentChunk:
        """Helper to create a DocumentChunk object from a collection of tagged blocks."""
        combined_text = "\n\n".join(b["text"] for b in blocks)
        
        # Deduplicate and sort pages
        pages_seen = sorted(list(set(b["page_number"] for b in blocks)))
        primary_page = pages_seen[0] if pages_seen else 1

        # Determine section title (prefer the first detected non-None heading in this window)
        section_title = None
        for b in blocks:
            if b.get("section_title"):
                section_title = b["section_title"]
                break

        char_cnt = len(combined_text)
        token_cnt = self.estimate_tokens(combined_text)
        chunk_id = self._generate_chunk_id(file_name, chunk_index, primary_page, combined_text)

        chunk_metadata = {
            "source_file": file_name,
            "created_at": datetime.now(timezone.utc).isoformat(),
            **doc_meta,
        }

        return DocumentChunk(
            chunk_id=chunk_id,
            text=combined_text,
            page_numbers=pages_seen,
            primary_page=primary_page,
            section_title=section_title,
            chunk_index=chunk_index,
            char_count=char_cnt,
            token_count=token_cnt,
            metadata=chunk_metadata,
        )