import pytest
from fastapi.testclient import TestClient
from app.main import app
import time

client = TestClient(app)

def test_upload_material():
    # We must use 'files' for UploadFile and 'data' for Form
    files = {"file": ("test.pdf", b"%PDF-1.4 mock pdf data", "application/pdf")}
    
    response = client.post("/api/v1/materials/upload", files=files, data=data)
    
    # 1. Verify accepted
    assert response.status_code == 202
    
    res_data = response.json()
    assert res_data["filename"] == "test.pdf"
    assert res_data["student_id"] == "12345-uuid"
    assert res_data["file_type"] == "application/pdf"
    
    file_id = res_data["file_id"]
    
    # Depending on TestClient behavior, the background task may have already run
    # so the status could be PENDING or READY. We just verify the endpoint works.
    
    # 2. Polling the status endpoint
    poll_res = client.get(f"/api/v1/materials/{file_id}")
    assert poll_res.status_code == 200
    poll_data = poll_res.json()
    assert poll_data["file_id"] == file_id
    assert poll_data["status"] in ["PENDING", "READY"]

def test_get_nonexistent_material():
    response = client.get("/api/v1/materials/invalid-file-id")
    assert response.status_code == 404
