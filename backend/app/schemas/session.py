from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field
import uuid

from app.schemas.learner import LearnerProfile
from app.schemas.interaction import InteractionTurn, PedagogicalState

class TeachingSession(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    learner_profile: LearnerProfile
    current_state: PedagogicalState = PedagogicalState.INIT
    current_topic: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    history: List[InteractionTurn] = Field(default_factory=list)
