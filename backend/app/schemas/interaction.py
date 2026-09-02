from typing import Optional, Any
from pydantic import BaseModel
from enum import Enum

class PedagogicalState(str, Enum):
    INIT = "INIT"
    PLANNING = "PLANNING"
    TEACHING = "TEACHING"
    DEMONSTRATING = "DEMONSTRATING"
    QUESTIONING = "QUESTIONING"
    EVALUATING = "EVALUATING"
    ADAPTING = "ADAPTING"
    ASSESSING = "ASSESSING"
    COMPLETED = "COMPLETED"

class InteractionTurn(BaseModel):
    turn_id: str
    state: PedagogicalState
    spoken_text: Optional[str] = None
    visual_intent: Optional[dict[str, Any]] = None
    student_input: Optional[str] = None
    misconception_detected: Optional[bool] = None
    remediation_notes: Optional[str] = None
