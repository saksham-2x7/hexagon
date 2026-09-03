# AI Teacher Backend

Welcome to the Team Virtual Hawks backend repository for the Bharat Academix AI Innovation Hackathon 2026.
This is a high-performance FastAPI service designed to orchestrate the AI Teacher pedagogical loop.

## Architecture Highlights
- **Sessions**: Robust pedagogical state machine (INIT -> TEACHING -> EVALUATING -> COMPLETED).
- **RAG & Materials**: Ingests multi-format documents (PDF, DOCX) and chunks them for semantic vector retrieval.
- **Analytics**: Auto-scores post-session assessments and generates historic `LearnerProgressSummary` analytics.
- **Interactions**: Real-time LLM proxying via `Server-Sent Events` (SSE).
- **Avatars**: Async orchestration pipelines to offload heavy video rendering.

## Developer Runbook

### Option A: Run Natively (Python / Uvicorn)
Ensure you have Python 3.11+ installed.

1. Activate your virtual environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Boot the server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Option B: Run via Docker (Recommended for Judges)
Ensure you have Docker and Docker Compose installed.

1. Boot the backend with a single command:
   ```bash
   docker-compose up --build
   ```

### Viewing the API Documentation
Once the server is running, you can interact with all the REST endpoints directly in your browser!
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
