import aiosqlite
import json
import logging
from typing import Optional, List, Dict, Any
import os

logger = logging.getLogger(__name__)

# Use /tmp for Vercel Serverless which has read-only filesystems
DB_PATH = "/tmp/app.db" if os.environ.get("VERCEL") else "app.db"

class DocumentStore:
    """
    An async document store backed by SQLite.
    Stores raw JSON under a specific collection and ID.
    """
    
    @staticmethod
    async def init_db():
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    collection TEXT,
                    id TEXT,
                    data TEXT,
                    PRIMARY KEY (collection, id)
                )
            """)
            await db.commit()
            logger.info(f"Initialized SQLite document store at {DB_PATH}.")
            
    @staticmethod
    async def get(collection: str, id: str) -> Optional[Dict[str, Any]]:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT data FROM documents WHERE collection = ? AND id = ?",
                (collection, id)
            )
            row = await cursor.fetchone()
            if row:
                return json.loads(row["data"])
            return None

    @staticmethod
    async def get_all(collection: str) -> List[Dict[str, Any]]:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT data FROM documents WHERE collection = ?",
                (collection,)
            )
            rows = await cursor.fetchall()
            return [json.loads(row["data"]) for row in rows]

    @staticmethod
    async def put(collection: str, id: str, data: Dict[str, Any]):
        async with aiosqlite.connect(DB_PATH) as db:
            json_data = json.dumps(data)
            await db.execute(
                """
                INSERT INTO documents (collection, id, data) 
                VALUES (?, ?, ?)
                ON CONFLICT(collection, id) DO UPDATE SET data = excluded.data
                """,
                (collection, id, json_data)
            )
            await db.commit()
