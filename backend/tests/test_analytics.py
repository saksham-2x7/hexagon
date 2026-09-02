import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_submit_assessment_valid():
    # 1. Create session
    payload = {
        "learner_profile": {
            "grade_or_level": "intermediate",
            "target_subject": "Math",
            "available_time_minutes": 30
        },
        "current_topic": "Fractions"
    }
    response = client.post("/api/v1/sessions", json=payload)
    assert response.status_code == 201
    session_id = response.json()["session_id"]

    # 2. Submit assessment
    assessment_payload = {
        "items": [
            {
                "question_id": "q1",
                "concept_tested": "Addition",
                "student_answer": "1/2",
                "correct_answer": "1/2",
                "is_correct": True
            },
            {
                "question_id": "q2",
                "concept_tested": "Addition",
                "student_answer": "3/4",
                "correct_answer": "3/4",
                "is_correct": True
            },
            {
                "question_id": "q3",
                "concept_tested": "Multiplication",
                "student_answer": "2/3",
                "correct_answer": "1/6",
                "is_correct": False,
                "misconception_identified": "Multiply numerators but added denominators"
            }
        ],
        "time_taken_seconds": 120
    }
    
    res = client.post(f"/api/v1/sessions/{session_id}/assessment", json=assessment_payload)
    assert res.status_code == 201
    report = res.json()
    assert report["total_score_percentage"] == 66.66666666666666
    assert "Addition" in report["strong_areas"]
    assert "Multiplication" in report["needs_improvement"]
    assert "Multiply numerators but added denominators" in report["detected_misconceptions"]

    # Verify session is COMPLETED
    sess_res = client.get(f"/api/v1/sessions/{session_id}")
    assert sess_res.json()["current_state"] == "COMPLETED"

def test_submit_assessment_invalid_session():
    res = client.post("/api/v1/sessions/invalid-id/assessment", json={"items": []})
    assert res.status_code == 404

def test_get_learner_progress():
    student_id = "550e8400-e29b-41d4-a716-446655440000"
    res = client.get(f"/api/v1/learners/{student_id}/progress")
    assert res.status_code == 200
    data = res.json()
    assert data["student_id"] == student_id
    assert data["completed_sessions_count"] == 1
    assert data["overall_average_score"] == 66.66666666666666
    assert data["masteries"]["Addition"] == "mastered"
    assert data["masteries"]["Multiplication"] == "needs_improvement"
    assert "Multiply numerators but added denominators" in data["active_misconceptions"]
    assert len(data["history"]) == 1

def test_get_learner_progress_empty():
    res = client.get("/api/v1/learners/123e4567-e89b-12d3-a456-426614174000/progress")
    assert res.status_code == 200
    data = res.json()
    assert data["completed_sessions_count"] == 0

def test_get_learner_progress_invalid_uuid():
    res = client.get("/api/v1/learners/not-a-uuid/progress")
    assert res.status_code == 404

def test_get_session_report():
    # Fetch report from the session created in the first test
    # We'll just create a new one to be isolated
    payload = {
        "learner_profile": {
            "educational_level": "ADVANCED", "preferred_language": "English", "learning_style": "ANALYTICAL",
            "target_subject": "Science",
            "available_time_minutes": 10
        },
        "current_topic": "Gravity"
    }
    res = client.post("/api/v1/sessions", json=payload)
    session_id = res.json()["session_id"]
    
    res = client.get(f"/api/v1/sessions/{session_id}/report")
    assert res.status_code == 404 # Not assessed yet
    
    assessment_payload = {
        "items": [{"question_id": "q1", "concept_tested": "G", "student_answer": "9.8", "correct_answer": "9.8", "is_correct": True}]
    }
    client.post(f"/api/v1/sessions/{session_id}/assessment", json=assessment_payload)
    
    res = client.get(f"/api/v1/sessions/{session_id}/report")
    assert res.status_code == 200
    assert res.json()["session_id"] == session_id
