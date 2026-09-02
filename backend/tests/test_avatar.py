import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_avatar_job():
    payload = {
        "session_id": "test-session-uuid",
        "spoken_text": "Hello, let's learn about quantum mechanics!"
    }
    
    response = client.post("/api/v1/avatar/jobs", json=payload)
    
    assert response.status_code == 202
    res_data = response.json()
    assert res_data["session_id"] == payload["session_id"]
    assert res_data["spoken_text"] == payload["spoken_text"]
    assert res_data["status"] in ["QUEUED", "COMPLETED"] # Depending on TestClient execution order
    
    job_id = res_data["job_id"]
    
    # Poll job status
    poll_res = client.get(f"/api/v1/avatar/jobs/{job_id}")
    assert poll_res.status_code == 200
    poll_data = poll_res.json()
    assert poll_data["job_id"] == job_id
    # Background task should have finished synchronously with TestClient, so it might be COMPLETED
    assert poll_data["status"] in ["QUEUED", "PROCESSING", "COMPLETED"]

def test_get_nonexistent_avatar_job():
    response = client.get("/api/v1/avatar/jobs/invalid-job-id")
    assert response.status_code == 404
