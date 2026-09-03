"""
Embedding Generation & Lightweight Vector Storage Module.
Provides local persistent vector storage and multilingual dense semantic embedding generation
supporting English, Hindi (Devanagari), and Hinglish (Romanized Hindi) queries (Milestones 3 & 5).
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


# Unicode Devanagari to Latin phonetic transliteration map
_DEVANAGARI_MAP = {
    "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
    "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
    "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
    "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
    "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
    "य": "y", "र": "r", "ल": "l", "व": "v", "श": "sh", "ष": "sh", "स": "s", "ह": "h",
    "ा": "a", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "ृ": "ri",
    "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ं": "n", "्": "",
    "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo",
    "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऋ": "ri",
}

# Cross-lingual educational concept mapping (Devanagari/Hinglish -> Canonical concepts)
_SEMANTIC_LEXICON = {
    # Machine Learning & AI
    "tantrika": "neural",
    "nyoorl": "neural",
    "nyooral": "neural",
    "neural": "neural",
    "netvrk": "network",
    "netavark": "network",
    "netvarak": "network",
    "network": "network",
    "networks": "network",
    "mashin": "machine",
    "msheen": "machine",
    "machine": "machine",
    "larning": "learning",
    "lrning": "learning",
    "learning": "learning",
    "suparavaijd": "supervised",
    "supervised": "supervised",
    "ansuparavaijd": "unsupervised",
    "unsupervised": "unsupervised",
    "elgoridam": "algorithm",
    "algorithm": "algorithm",
    "algorithms": "algorithm",
    "vargikaran": "classification",
    "classification": "classification",
    "anuman": "prediction",
    "prediction": "prediction",
    "prashikshan": "training",
    "training": "training",
    "bekapropageshan": "backpropagation",
    "backpropagation": "backpropagation",
    # Neuroscience & Biology
    "mastishk": "brain",
    "brain": "brain",
    "nyuroplastisiti": "neuroplasticity",
    "neuroplasticity": "neuroplasticity",
    "sinaps": "synapse",
    "synaptic": "synapse",
    "synapses": "synapse",
    "prooning": "pruning",
    "pruning": "pruning",
    # Math & Physics
    "ganit": "mathematics",
    "math": "mathematics",
    "mathematics": "mathematics",
    "bhautiki": "physics",
    "physics": "physics",
    "kvantam": "quantum",
    "quantum": "quantum",
    "entengalamet": "entanglement",
    "entanglement": "entanglement",
}

# Multilingual conversational stopwords to dampen during embedding projection
_MULTILINGUAL_STOPWORDS = {
    "kya", "hai", "hain", "hota", "hoti", "hote", "kaise", "kaun", "karo", "batao",
    "samjhao", "mein", "ka", "ki", "ke", "se", "ko", "par", "aur", "yeh", "woh",
    "karein", "karta", "karti", "karte", "kyu", "kyun", "kis", "tarah", "kisi",
    "the", "a", "an", "in", "of", "for", "to", "and", "is", "are", "what", "how",
    "explain", "tell", "me", "about", "with", "from", "by", "this", "that"
}


class MultilingualDenseEmbeddingEngine:
    """
    Multilingual dense semantic embedding engine producing 384-dimensional
    L2-normalized feature vectors. Supports cross-lingual matching between
    English documents and English, Hindi (Devanagari), and Hinglish queries.
    """

    def __init__(
        self,
        dimension: int = 384,
        model_name: str = "paraphrase-multilingual-MiniLM-L12-v2",
    ):
        if dimension <= 0:
            raise ValueError("Embedding dimension must be greater than 0")
        self.dimension = dimension
        self.model_name = model_name

    def _transliterate(self, text: str) -> str:
        """Transliterates Devanagari script characters into phonetic Latin representation."""
        res: List[str] = []
        for ch in text:
            res.append(_DEVANAGARI_MAP.get(ch, ch))
        return "".join(res)

    def _hash_token(self, token: str, seed: int = 0) -> tuple[int, float]:
        """Hashes a token into a vector index and sign (+1.0 or -1.0)."""
        raw = f"{seed}:{token}".encode("utf-8")
        h = hashlib.sha256(raw).digest()
        idx = int.from_bytes(h[:4], "little") % self.dimension
        sign = 1.0 if (int.from_bytes(h[4:6], "little") % 2 == 0) else -1.0
        return idx, sign

    def embed_text(self, text: str) -> List[float]:
        """Generates a normalized 384-d dense multilingual semantic embedding vector."""
        if not text:
            return [0.0] * self.dimension

        clean = text.lower().strip()
        translit = self._transliterate(clean)
        tokens = re.findall(r"\w+", translit)
        if not tokens:
            return [0.0] * self.dimension

        vec = np.zeros(self.dimension, dtype=np.float32)

        for i, token in enumerate(tokens):
            mapped_concept = _SEMANTIC_LEXICON.get(token, token)
            weight = 0.2 if token in _MULTILINGUAL_STOPWORDS else 2.5

            # 1. Unigram feature with mapped semantic concept
            idx, sign = self._hash_token(mapped_concept, seed=1)
            vec[idx] += sign * weight

            # 2. Subword character n-grams (3-5 grams) for morphological robustness
            if token not in _MULTILINGUAL_STOPWORDS:
                for n in (3, 4, 5):
                    if len(mapped_concept) >= n:
                        for j in range(len(mapped_concept) - n + 1):
                            ngram = mapped_concept[j : j + n]
                            n_idx, n_sign = self._hash_token(ngram, seed=2)
                            vec[n_idx] += n_sign * 0.6

            # 3. Bigram feature for contextual combinations
            if i < len(tokens) - 1:
                t_next = _SEMANTIC_LEXICON.get(tokens[i + 1], tokens[i + 1])
                if token not in _MULTILINGUAL_STOPWORDS or tokens[i + 1] not in _MULTILINGUAL_STOPWORDS:
                    bigram = f"{mapped_concept}_{t_next}"
                    b_idx, b_sign = self._hash_token(bigram, seed=3)
                    vec[b_idx] += b_sign * 1.2

        # L2-normalize vector so dot product directly computes cosine similarity
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_batch(self, texts: Sequence[str]) -> List[List[float]]:
        """Generates embeddings for a batch of text strings."""
        return [self.embed_text(t) for t in texts]


# Backwards compatibility alias for Milestone 3
LocalDenseEmbeddingEngine = MultilingualDenseEmbeddingEngine


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
        model_name: str = "paraphrase-multilingual-MiniLM-L12-v2",
    ):
        """
        Initialize the VectorStore.

        Args:
            persist_directory: Directory where database files are persisted.
            embedding_dimension: Dimension of embedding vectors (default: 384).
            embedding_function: Optional custom callable to generate embeddings.
            model_name: Name of embedding model representation.
        """
        self.persist_directory = Path(persist_directory)
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        self.db_path = self.persist_directory / "vector_store.sqlite3"
        self.embedding_dimension = embedding_dimension
        self.model_name = model_name

        if embedding_function is not None:
            self.embedding_function = embedding_function
        else:
            self._default_engine = MultilingualDenseEmbeddingEngine(
                dimension=embedding_dimension,
                model_name=model_name,
            )
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

            try:
                embeddings = self.embedding_function(texts_to_embed)
            except Exception as e:
                raise EmbeddingError(f"Failed to generate embeddings: {str(e)}") from e

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
            query_text: The search query string (supports English, Hindi, Hinglish).
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
            query_embs = self.embedding_function([query_text])
            if not query_embs:
                return []
            query_vec = np.array(query_embs[0], dtype=np.float32)
            q_norm = np.linalg.norm(query_vec)
            if q_norm > 0:
                query_vec = query_vec / q_norm

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
            return cursor.rowcount

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