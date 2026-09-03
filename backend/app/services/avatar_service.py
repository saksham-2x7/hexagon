import asyncio
from typing import Dict, Optional
from datetime import datetime, timezone
from app.schemas.avatar import AvatarJob, JobStatus
from app.core.database import DocumentStore

class AvatarService:
    async def create_job(self, session_id: str, spoken_text: str) -> AvatarJob:
        job = AvatarJob(session_id=session_id, spoken_text=spoken_text)
        await DocumentStore.put("avatars", job.job_id, job.model_dump(mode="json"))
        return job

    async def get_job(self, job_id: str) -> Optional[AvatarJob]:
        data = await DocumentStore.get("avatars", job_id)
        if data:
            return AvatarJob(**data)
        return None

    async def mock_render_avatar(self, job_id: str):
        """
        Mock background task that sleeps for 2 seconds to simulate video generation.
        """
        job = await self.get_job(job_id)
        if not job:
            return
            
        job.status = JobStatus.PROCESSING
        await DocumentStore.put("avatars", job_id, job.model_dump(mode="json"))
        
        # Simulate rendering latency
        await asyncio.sleep(2)
        
        # Mark as completed with a dummy URL
        job.status = JobStatus.COMPLETED
        job.media_url = f"https://mock-storage.com/clip_{job_id}.mp4"
        job.completed_at = datetime.now(timezone.utc)
        
        await DocumentStore.put("avatars", job_id, job.model_dump(mode="json"))

avatar_service = AvatarService()
