from enum import Enum
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

class MasteryStatus(str, Enum):
    MASTERED = "mastered"
    IN_PROGRESS = "in_progress"
    NEEDS_IMPROVEMENT = "needs_improvement"

class ConceptScore(BaseModel):
    concept_name: str
    correct_count: int
    total_questions: int
    mastery_status: MasteryStatus

class AssessmentItem(BaseModel):
    question_id: str
    concept_tested: str
    student_answer: str
    correct_answer: str
    is_correct: bool
    misconception_identified: Optional[str] = None

class AssessmentSubmission(BaseModel):
    items: List[AssessmentItem]
    time_taken_seconds: Optional[int] = None

class DiagnosticReport(BaseModel):
    report_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    student_id: str
    topic: str
    total_score_percentage: float
    strong_areas: List[str]
    needs_improvement: List[str]
    detected_misconceptions: List[str]
    recommended_revision: List[str]
    suggested_next_topics: List[str]
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LearnerProgressSummary(BaseModel):
    student_id: str
    completed_sessions_count: int
    overall_average_score: float
    masteries: Dict[str, MasteryStatus]
    active_misconceptions: List[str]
    history: List[DiagnosticReport]
