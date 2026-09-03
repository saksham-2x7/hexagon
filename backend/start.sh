#!/bin/bash
echo "Starting data ingestion (SQLite & ChromaDB)..."
python scripts/ingest_demo_data.py

echo "Starting FastAPI Server..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
