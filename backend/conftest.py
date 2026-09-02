import pytest
import asyncio
import aiosqlite
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