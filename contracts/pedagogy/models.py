from enum import Enum
from typing import List, Optional, Union, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class EducationalLevel(str, Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"

class LearningStyle(str, Enum):
    CONCEPTUAL = "CONCEPTUAL"
    PRACTICAL = "PRACTICAL"
    ANALYTICAL = "ANALYTICAL"

class LearnerProfile(BaseModel):
    student_id: Optional[str] = None
    educational_level: EducationalLevel
    target_subject: str
    available_time_minutes: int = Field(gt=0)
    preferred_language: str = "en"
    learning_style: LearningStyle = LearningStyle.CONCEPTUAL

class Module(BaseModel):
    id: str
    title: str
    concepts: List[str]
    estimated_time_minutes: int
    prerequisites: List[str] = Field(default_factory=list)

class LessonPlan(BaseModel):
    topic: str
    overview: str
    target_duration_minutes: int
    modules: List[Module]

class VisualIntentType(str, Enum):
    TEXT = "text"
    EQUATION = "equation"
    DIAGRAM_REF = "diagram_ref"
    CODE = "code"
    TIMELINE = "timeline"

class VisualIntent(BaseModel):
    type: VisualIntentType
    payload: str

class PromptType(str, Enum):
    CONCEPT_CHECK = "concept_check"
    MCQ = "mcq"
    EXPLAIN_IN_OWN_WORDS = "explain_in_own_words"

class InteractivePrompt(BaseModel):
    prompt_type: PromptType
    question_text: str
    options: Optional[List[str]] = None

class TeachingTurn(BaseModel):
    turn_id: str
    module_id: str
    concept_id: str
    spoken_text: str
    visual_intent: VisualIntent
    interactive_prompt: Optional[InteractivePrompt] = None

class ResponseType(str, Enum):
    TEXT = "text"
    VOICE_TRANSCRIPT = "voice_transcript"

class StudentTurn(BaseModel):
    turn_id: str
    response_text: str
    response_type: ResponseType
    timestamp: datetime

class UnderstandingStatus(str, Enum):
    UNDERSTOOD = "UNDERSTOOD"
    MISCONCEPTION = "MISCONCEPTION"
    PARTIAL = "PARTIAL"
    OFF_TOPIC = "OFF_TOPIC"

class MisconceptionType(str, Enum):
    FACTUAL_ERROR = "FACTUAL_ERROR"
    CONCEPTUAL_FLAW = "CONCEPTUAL_FLAW"
    OVERGENERALIZATION = "OVERGENERALIZATION"
    MISSING_PREREQUISITE = "MISSING_PREREQUISITE"
    OFF_TOPIC = "OFF_TOPIC"

class PedagogicalEvaluation(BaseModel):
    understanding_status: UnderstandingStatus
    misconception_type: Optional[MisconceptionType] = None
    detected_gap_or_misconception: Optional[str] = None
    confidence_score: float = Field(ge=0.0, le=1.0)
    pedagogical_rationale: str

class NextAction(str, Enum):
    PROCEED_NEXT_CONCEPT = "PROCEED_NEXT_CONCEPT"
    REEXPLAIN_WITH_ANALOGY = "REEXPLAIN_WITH_ANALOGY"
    BREAK_DOWN_PREREQUISITE = "BREAK_DOWN_PREREQUISITE"
    PROVIDE_SIMPLIFIED_EXAMPLE = "PROVIDE_SIMPLIFIED_EXAMPLE"
    CHALLENGE_DEEPER = "CHALLENGE_DEEPER"

class AdaptiveTransition(BaseModel):
    next_action: NextAction
    adaptation_context: str
