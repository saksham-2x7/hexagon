import pytest
from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

def test_student_interact_valid():
    # 1. Create session
    payload = {
        "learner_profile": {
            "educational_level": "BEGINNER", "preferred_language": "English", "learning_style": "CONCEPTUAL",
            "target_subject": "Math",
            "available_time_minutes": 20
        },
        "current_topic": "Algebra"
    }
    res_create = client.post("/api/v1/sessions", json=payload)
    assert res_create.status_code == 201
    session_id = res_create.json()["session_id"]
    
    # 2. Student inputs some text
    res_interact = client.post(f"/api/v1/sessions/{session_id}/interact", json={"student_input": "I don't understand fractions."})
    assert res_interact.status_code == 202
    
    # Verify history
    sess_res = client.get(f"/api/v1/sessions/{session_id}")
    history = sess_res.json()["history"]
    assert len(history) == 1
    assert history[0]["student_input"] == "I don't understand fractions."

def test_interact_invalid_session():
    res = client.post("/api/v1/sessions/bad-session-id/interact", json={"student_input": "Hello"})
    assert res.status_code == 404

def test_stream_interaction():
    # 1. Create session
    payload = {
        "learner_profile": {
            "educational_level": "ADVANCED", "preferred_language": "English", "learning_style": "ANALYTICAL",
            "target_subject": "Physics",
            "available_time_minutes": 30
        },
        "current_topic": "Relativity"
    }
    res_create = client.post("/api/v1/sessions", json=payload)
    session_id = res_create.json()["session_id"]
    
    # 2. Get SSE stream
    with client.stream("GET", f"/api/v1/sessions/{session_id}/stream") as res_stream:
        assert res_stream.status_code == 200
        assert res_stream.headers["content-type"] == "text/event-stream; charset=utf-8"
        
        # We can read the first line/chunk
        line = res_stream.iter_lines()
        first_event = next(line)
        
        # Should start with "data: "
        assert first_event.startswith("data: ")
        
        # Ensure it's valid JSON payload inside
        json_data = json.loads(first_event[6:])
        assert "status" in json_data
        assert json_data["status"] == "thinking"

def test_stream_invalid_session():
    res = client.get("/api/v1/sessions/bad-session-id/stream")
    assert res.status_code == 404
