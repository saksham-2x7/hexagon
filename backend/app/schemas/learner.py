from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, field_validator
from uuid import UUID

class GradeLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class LearnerProfile(BaseModel):
    student_id: str
    grade_or_level: GradeLevel
    target_subject: str
    learning_goal: Optional[str] = None
    preferred_language: str = "en"
    time_budget_minutes: int
    preferred_style: Optional[str] = None
    
    @field_validator("time_budget_minutes")
    @classmethod
    def check_time_budget(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("time_budget_minutes must be > 0")
        return v
