"""
Embedding Generation & Lightweight Vector Storage Module.
Provides local persistent vector storage and dense semantic embedding generation
for structured educational chunks (Milestone 3).
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path
import re
import sqlite3
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional, Sequence, Union

import numpy as np

from app.rag.chunker import DocumentChunk
from app.rag.exceptions import EmbeddingError, VectorStoreError


@dataclass
class QueryResult:
    """Represents a matched chunk retrieved via vector similarity search."""
    chunk_id: str
    document_id: str
    text: str
    score: float
    page_numbers: List[int]
    primary_page: int
    section_title: Optional[str]
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert QueryResult to JSON-serializable dictionary."""
        return {
            "chunk_id": self.chunk_id,
            "document_id": self.document_id,
            "text": self.text,
            "score": round(self.score, 4),
            "page_numbers": self.page_numbers,
            "primary_page": self.primary_page,
            "section_title": self.section_title,
            "metadata": self.metadata,
        }


class LocalDenseEmbeddingEngine:
    """
    Fast, deterministic dense semantic embedding engine producing 384-dimensional
    L2-normalized feature vectors on CPU without heavy external dependencies.
    """

    def __init__(self, dimension: int = 384):
        if dimension <= 0:
            raise ValueError("Embedding dimension must be greater than 0")
        self.dimension = dimension

    def _hash_token(self, token: str, seed: int = 0) -> tuple[int, float]:
        """Hashes a token into an index and sign (+1.0 or -1.0)."""
        raw = f"{seed}:{token}".encode("utf-8")
        h = hashlib.sha256(raw).digest()
        idx = int.from_bytes(h[:4], "little") % self.dimension
        sign = 1.0 if (int.from_bytes(h[4:6], "little") % 2 == 0) else -1.0
        return idx, sign

    def embed_text(self, text: str) -> List[float]:
        """Generates a normalized 384-d dense semantic embedding vector for a single text."""
        if not text:
            return [0.0] * self.dimension

        clean_text = text.lower().strip()
        tokens = re.findall(r"\w+", clean_text)
        if not tokens:
            return [0.0] * self.dimension

        vec = np.zeros(self.dimension, dtype=np.float32)

        for i, token in enumerate(tokens):
            # Unigram feature
            idx, sign = self._hash_token(token, seed=1)
            vec[idx] += sign * 1.5

            # Subword character n-grams (3-4 grams) for morphological similarity
            for n in (3, 4):
                if len(token) >= n:
                    for j in range(len(token) - n + 1):
                        ngram = token[j : j + n]
                        n_idx, n_sign = self._hash_token(ngram, seed=2)
                        vec[n_idx] += n_sign * 0.5

            # Bigram feature for sequential context
            if i < len(tokens) - 1:
                bigram = f"{token}_{tokens[i + 1]}"
                b_idx, b_sign = self._hash_token(bigram, seed=3)
                vec[b_idx] += b_sign * 1.0

        # L2-normalize vector so dot product directly computes cosine similarity
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_batch(self, texts: Sequence[str]) -> List[List[float]]:
        """Generates embeddings for a batch of text strings."""
        return [self.embed_text(t) for t in texts]


class VectorStore:
    """
    Lightweight, persistent local vector database for storing and querying educational chunks.
    Uses SQLite for metadata & vector storage, and NumPy for vector cosine calculations.
    """

    def __init__(
        self,
        persist_directory: Union[str, Path] = "./.chroma_db",
        embedding_dimension: int = 384,
        embedding_function: Optional[Callable[[List[str]], List[List[float]]]] = None,
    ):
        """
        Initialize the VectorStore.

        Args:
            persist_directory: Directory where database files are persisted.
            embedding_dimension: Dimension of embedding vectors (default: 384).
            embedding_function: Optional custom callable to generate embeddings.
        """
        self.persist_directory = Path(persist_directory)
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        self.db_path = self.persist_directory / "vector_store.sqlite3"
        self.embedding_dimension = embedding_dimension

        if embedding_function is not None:
            self.embedding_function = embedding_function
        else:
            self._default_engine = LocalDenseEmbeddingEngine(dimension=embedding_dimension)
            self.embedding_function = self._default_engine.embed_batch

        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        """Creates a new SQLite connection with foreign keys and WAL mode."""
        conn = sqlite3.connect(str(self.db_path))
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        return conn

    def _init_db(self) -> None:
        """Initializes the database schema."""
        try:
            with self._get_connection() as conn:
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS vector_entries (
                        chunk_id TEXT PRIMARY KEY,
                        document_id TEXT NOT NULL,
                        collection_name TEXT NOT NULL,
                        text TEXT NOT NULL,
                        embedding TEXT NOT NULL,
                        page_numbers TEXT NOT NULL,
                        primary_page INTEGER NOT NULL,
                        section_title TEXT,
                        char_count INTEGER NOT NULL,
                        token_count INTEGER NOT NULL,
                        metadata TEXT NOT NULL,
                        created_at TEXT NOT NULL
                    );
                    """
                )
                conn.execute(
                    """
                    CREATE INDEX IF NOT EXISTS idx_doc_col
                    ON vector_entries(document_id, collection_name);
                    """
                )
                conn.execute(
                    """
                    CREATE INDEX IF NOT EXISTS idx_col
                    ON vector_entries(collection_name);
                    """
                )
        except Exception as e:
            raise VectorStoreError(f"Failed to initialize vector database at '{self.db_path}': {str(e)}") from e

    def store_chunks(
        self,
        document_id: str,
        chunks: Sequence[Union[DocumentChunk, Dict[str, Any]]],
        collection_name: str = "default",
    ) -> int:
        """
        Embeds and upserts structured chunks into the persistent vector store.

        Args:
            document_id: Unique identifier for the parent document.
            chunks: Sequence of DocumentChunk objects or chunk dictionaries.
            collection_name: Optional namespace/collection tag (default: 'default').

        Returns:
            Total number of chunks successfully stored.
        """
        if not document_id:
            raise VectorStoreError("document_id cannot be empty")
        if not chunks:
            return 0

        try:
            # 1. Normalize chunks into standardized structures
            normalized_chunks: List[Dict[str, Any]] = []
            texts_to_embed: List[str] = []

            for idx, c in enumerate(chunks):
                if isinstance(c, DocumentChunk):
                    c_dict = c.to_dict()
                elif isinstance(c, dict):
                    c_dict = c
                else:
                    raise VectorStoreError(f"Invalid chunk type: {type(c).__name__}")

                chunk_text = c_dict.get("text", "").strip()
                if not chunk_text:
                    continue

                chunk_id = c_dict.get("chunk_id") or f"{document_id}_chunk_{idx}"
                page_numbers = c_dict.get("page_numbers", [c_dict.get("primary_page", 1)])
                primary_page = c_dict.get("primary_page", page_numbers[0] if page_numbers else 1)
                section_title = c_dict.get("section_title")
                char_count = c_dict.get("char_count", len(chunk_text))
                token_count = c_dict.get("token_count", max(1, math.ceil(len(chunk_text) / 4)))
                metadata = c_dict.get("metadata", {})

                normalized_chunks.append({
                    "chunk_id": chunk_id,
                    "document_id": document_id,
                    "collection_name": collection_name,
                    "text": chunk_text,
                    "page_numbers": json.dumps(page_numbers),
                    "primary_page": primary_page,
                    "section_title": section_title,
                    "char_count": char_count,
                    "token_count": token_count,
                    "metadata": json.dumps(metadata),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })
                texts_to_embed.append(chunk_text)

            if not normalized_chunks:
                return 0

            # 2. Generate embeddings in batch
            try:
                embeddings = self.embedding_function(texts_to_embed)
            except Exception as e:
                raise EmbeddingError(f"Failed to generate embeddings: {str(e)}") from e

            # 3. Store records in SQLite transaction
            with self._get_connection() as conn:
                for item, emb in zip(normalized_chunks, embeddings):
                    conn.execute(
                        """
                        INSERT OR REPLACE INTO vector_entries (
                            chunk_id, document_id, collection_name, text, embedding,
                            page_numbers, primary_page, section_title, char_count,
                            token_count, metadata, created_at
                        ) VALUES (
                            :chunk_id, :document_id, :collection_name, :text, :embedding,
                            :page_numbers, :primary_page, :section_title, :char_count,
                            :token_count, :metadata, :created_at
                        );
                        """,
                        {
                            **item,
                            "embedding": json.dumps(emb),
                        },
                    )

            return len(normalized_chunks)

        except Exception as e:
            if isinstance(e, (VectorStoreError, EmbeddingError)):
                raise
            raise VectorStoreError(f"Error storing chunks for document '{document_id}': {str(e)}") from e

    def query(
        self,
        query_text: str,
        document_id: Optional[str] = None,
        top_k: int = 5,
        collection_name: Optional[str] = None,
        min_score: float = 0.0,
    ) -> List[QueryResult]:
        """
        Performs vector similarity search against stored chunk embeddings.

        Args:
            query_text: The search query string.
            document_id: Optional filter to restrict search to a specific document.
            top_k: Maximum number of top matching chunks to return (default: 5).
            collection_name: Optional collection filter.
            min_score: Minimum similarity score threshold (0.0 to 1.0).

        Returns:
            List of QueryResult objects sorted by descending cosine similarity.
        """
        if not query_text or not query_text.strip():
            return []

        try:
            # 1. Generate query embedding vector
            query_embs = self.embedding_function([query_text])
            if not query_embs:
                return []
            query_vec = np.array(query_embs[0], dtype=np.float32)
            q_norm = np.linalg.norm(query_vec)
            if q_norm > 0:
                query_vec = query_vec / q_norm

            # 2. Fetch candidate rows from SQLite
            sql = "SELECT chunk_id, document_id, text, embedding, page_numbers, primary_page, section_title, metadata FROM vector_entries WHERE 1=1"
            params: List[Any] = []

            if document_id:
                sql += " AND document_id = ?"
                params.append(document_id)
            if collection_name:
                sql += " AND collection_name = ?"
                params.append(collection_name)

            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(sql, params)
                rows = cursor.fetchall()

            if not rows:
                return []

            # 3. Compute cosine similarity across candidate vectors
            results: List[QueryResult] = []
            chunk_vectors: List[np.ndarray] = []
            row_metadata_list: List[tuple] = []

            for row in rows:
                c_id, doc_id, text, emb_json, pages_json, prim_page, sec_title, meta_json = row
                emb_list = json.loads(emb_json)
                vec = np.array(emb_list, dtype=np.float32)
                v_norm = np.linalg.norm(vec)
                if v_norm > 0:
                    vec = vec / v_norm
                chunk_vectors.append(vec)
                row_metadata_list.append((c_id, doc_id, text, json.loads(pages_json), prim_page, sec_title, json.loads(meta_json)))

            if not chunk_vectors:
                return []

            matrix = np.vstack(chunk_vectors)
            scores = np.dot(matrix, query_vec)

            for score, meta_tuple in zip(scores, row_metadata_list):
                score_val = float(score)
                if score_val >= min_score:
                    c_id, doc_id, text, pages, prim_page, sec_title, meta = meta_tuple
                    results.append(
                        QueryResult(
                            chunk_id=c_id,
                            document_id=doc_id,
                            text=text,
                            score=score_val,
                            page_numbers=pages,
                            primary_page=prim_page,
                            section_title=sec_title,
                            metadata=meta,
                        )
                    )

            # 4. Sort descending by similarity score
            results.sort(key=lambda r: r.score, reverse=True)
            return results[:top_k]

        except Exception as e:
            raise VectorStoreError(f"Query execution failed: {str(e)}") from e

    def count(
        self,
        document_id: Optional[str] = None,
        collection_name: Optional[str] = None,
    ) -> int:
        """Returns the total number of stored chunks."""
        sql = "SELECT COUNT(*) FROM vector_entries WHERE 1=1"
        params: List[Any] = []
        if document_id:
            sql += " AND document_id = ?"
            params.append(document_id)
        if collection_name:
            sql += " AND collection_name = ?"
            params.append(collection_name)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, params)
            return int(cursor.fetchone()[0])

    def get(self, chunk_id: str) -> Optional[QueryResult]:
        """Retrieves a single chunk by chunk_id."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT chunk_id, document_id, text, page_numbers, primary_page, section_title, metadata
                FROM vector_entries WHERE chunk_id = ?
                """,
                (chunk_id,),
            )
            row = cursor.fetchone()
            if not row:
                return None
            c_id, doc_id, text, pages_json, prim_page, sec_title, meta_json = row
            return QueryResult(
                chunk_id=c_id,
                document_id=doc_id,
                text=text,
                score=1.0,
                page_numbers=json.loads(pages_json),
                primary_page=prim_page,
                section_title=sec_title,
                metadata=json.loads(meta_json),
            )

    def delete_document(
        self,
        document_id: str,
        collection_name: Optional[str] = None,
    ) -> int:
        """Deletes all chunks associated with a document_id."""
        sql = "DELETE FROM vector_entries WHERE document_id = ?"
        params: List[Any] = [document_id]
        if collection_name:
            sql += " AND collection_name = ?"
            params.append(collection_name)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, params)
            deleted_count = cursor.rowcount
            return deleted_count

    def clear(self, collection_name: Optional[str] = None) -> int:
        """Clears records from the vector store."""
        sql = "DELETE FROM vector_entries"
        params: List[Any] = []
        if collection_name:
            sql += " WHERE collection_name = ?"
            params.append(collection_name)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, params)
            return cursor.rowcount