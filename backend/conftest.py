import pytest
import asyncio
from app.core.database import DocumentStore

@pytest.fixture(scope="session", autouse=True)
def init_test_db():
    asyncio.run(DocumentStore.init_db())
    yield
