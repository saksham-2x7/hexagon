from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
import os

# Add hexagon root to pythonpath
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1.router import api_router
from app.core.database import DocumentStore

setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await DocumentStore.init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# Top level health endpoint to match GET /health specifically 
from app.api.v1.endpoints.health import health_check
app.add_api_route("/health", health_check, methods=["GET"], tags=["health"])
