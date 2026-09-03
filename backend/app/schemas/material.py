from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

class ProcessingStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    READY = "READY"
    FAILED = "FAILED"

class MaterialMetadata(BaseModel):
    file_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    filename: str
    file_type: str
    status: ProcessingStatus = ProcessingStatus.PENDING
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    error_message: Optional[str] = None
