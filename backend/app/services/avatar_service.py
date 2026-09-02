import asyncio
from typing import Dict, Optional
from datetime import datetime, timezone
from app.schemas.avatar import AvatarJob, JobStatus

class AvatarService:
    def __init__(self):
        self._jobs: Dict[str, AvatarJob] = {}

    async def create_job(self, session_id: str, spoken_text: str) -> AvatarJob:
        job = AvatarJob(session_id=session_id, spoken_text=spoken_text)
        self._jobs[job.job_id] = job
        return job

    async def get_job(self, job_id: str) -> Optional[AvatarJob]:
        return self._jobs.get(job_id)

    async def mock_render_avatar(self, job_id: str):
        """
        Mock background task that sleeps for 2 seconds to simulate video generation.
        """
        job = self._jobs.get(job_id)
        if not job:
            return
            
        job.status = JobStatus.PROCESSING
        self._jobs[job_id] = job
        
        # Simulate rendering latency
        await asyncio.sleep(2)
        
        # Mark as completed with a dummy URL
        job.status = JobStatus.COMPLETED
        job.media_url = f"https://mock-storage.com/clip_{job_id}.mp4"
        job.completed_at = datetime.now(timezone.utc)
        
        self._jobs[job_id] = job

avatar_service = AvatarService()
