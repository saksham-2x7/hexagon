from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from app.schemas.avatar import AvatarJob
from app.services.avatar_service import avatar_service

router = APIRouter()

class CreateAvatarJobRequest(BaseModel):
    session_id: str
    spoken_text: str

@router.post("/jobs", response_model=AvatarJob, status_code=status.HTTP_202_ACCEPTED)
async def create_avatar_job(
    request: CreateAvatarJobRequest,
    background_tasks: BackgroundTasks
):
    job = await avatar_service.create_job(
        session_id=request.session_id, 
        spoken_text=request.spoken_text
    )
    
    # Spawn background task to process the video
    background_tasks.add_task(avatar_service.mock_render_avatar, job.job_id)
    
    return job

@router.get("/jobs/{job_id}", response_model=AvatarJob)
async def get_avatar_job(job_id: str):
    job = await avatar_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avatar job not found")
    return job
