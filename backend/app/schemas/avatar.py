from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

class JobStatus(str, Enum):
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class AvatarJob(BaseModel):
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    spoken_text: str
    status: JobStatus = JobStatus.QUEUED
    media_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
