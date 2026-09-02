import pytest
import asyncio
import aiosqlite
import sys
import os

# Add hexagon root to pythonpath for tests
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import DocumentStore, DB_PATH

@pytest.fixture(scope="session", autouse=True)
def init_test_db():
    async def _init_and_clean():
        await DocumentStore.init_db()
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("DELETE FROM documents")
            await db.commit()
    asyncio.run(_init_and_clean())
    yield