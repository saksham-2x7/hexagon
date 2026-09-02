from typing import Optional, Any
from pydantic import BaseModel
from contracts.pedagogy.state_machine import TeachingState

PedagogicalState = TeachingState

class InteractionTurn(BaseModel):
    turn_id: str
    state: TeachingState
    spoken_text: Optional[str] = None
    visual_intent: Optional[dict[str, Any]] = None
    student_input: Optional[str] = None
    misconception_detected: Optional[bool] = None
    remediation_notes: Optional[str] = None