import pytest
import asyncio
import json
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_full_integration_sse_stream():
    """
    Tests the Milestone 8 integration: FSM, RAG, and Gemini via SSE stream.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Start a session
        create_payload = {
            "learner_profile": {
                "educational_level": "BEGINNER",
                "target_subject": "Physics",
                "available_time_minutes": 20,
                "preferred_language": "English",
                "learning_style": "CONCEPTUAL"
            },
            "current_topic": "Ohm's Law"
        }
        
        response = await ac.post("/api/v1/sessions", json=create_payload)
        assert response.status_code == 201
        session_data = response.json()
        session_id = session_data["session_id"]
        assert session_data["current_state"] == "IDLE"

        # 2. Add a student interaction
        interact_payload = {
            "student_input": "I don't understand how resistance affects current."
        }
        resp = await ac.post(f"/api/v1/sessions/{session_id}/interact", json=interact_payload)
        assert resp.status_code == 202

        # 3. Request the stream
        async with ac.stream("GET", f"/api/v1/sessions/{session_id}/stream") as stream_response:
            assert stream_response.status_code == 200
            
            chunks = []
            async for chunk in stream_response.aiter_text():
                if chunk.strip():
                    chunks.append(chunk.strip())
                    
            assert len(chunks) >= 1
            # The first chunk should always be the safe streaming 'thinking' status
            first_event_str = chunks[0].split("\n\n")[0].replace('data: ', '')
            json_data = json.loads(first_event_str)
            assert "status" in json_data
            assert json_data["status"] == "thinking"
