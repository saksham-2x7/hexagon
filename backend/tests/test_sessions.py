import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "ai-teacher-backend"}

def test_create_session_valid():
    payload = {
        "learner_profile": {
            "student_id": "123e4567-e89b-12d3-a456-426614174000",
            "grade_or_level": "beginner",
            "target_subject": "Math",
            "time_budget_minutes": 20
        },
        "current_topic": "Algebra"
    }
    response = client.post("/api/v1/sessions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["current_state"] == "INIT"
    assert "session_id" in data
    assert data["learner_profile"]["time_budget_minutes"] == 20

def test_create_session_invalid_time_budget():
    payload = {
        "learner_profile": {
            "student_id": "123e4567-e89b-12d3-a456-426614174000",
            "grade_or_level": "beginner",
            "target_subject": "Math",
            "time_budget_minutes": -5
        },
        "current_topic": "Algebra"
    }
    response = client.post("/api/v1/sessions", json=payload)
    assert response.status_code == 422

def test_get_nonexistent_session():
    response = client.get("/api/v1/sessions/invalid-id")
    assert response.status_code == 404

def test_state_transition():
    # 1. Create a session
    payload = {
        "learner_profile": {
            "student_id": "test-student",
            "grade_or_level": "advanced",
            "target_subject": "Physics",
            "time_budget_minutes": 60
        },
        "current_topic": "Quantum Mechanics"
    }
    response = client.post("/api/v1/sessions", json=payload)
    assert response.status_code == 201
    session_id = response.json()["session_id"]
    old_updated_at = response.json()["updated_at"]

    # 2. Valid transition (INIT -> PLANNING)
    patch_res = client.patch(f"/api/v1/sessions/{session_id}/state", json={"state": "PLANNING"})
    assert patch_res.status_code == 200
    assert patch_res.json()["current_state"] == "PLANNING"
    new_updated_at = patch_res.json()["updated_at"]
    assert new_updated_at != old_updated_at  # Should be updated

    # 3. Invalid transition (PLANNING -> INIT without COMPLETED)
    patch_invalid = client.patch(f"/api/v1/sessions/{session_id}/state", json={"state": "INIT"})
    assert patch_invalid.status_code == 400
    assert "Invalid state transition" in patch_invalid.json()["detail"]
