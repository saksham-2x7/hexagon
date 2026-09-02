from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uuid

from app.schemas.learner import LearnerProfile
from app.schemas.session import TeachingSession
from app.schemas.interaction import PedagogicalState, InteractionTurn
from app.repositories.session_repo import session_repo
from app.services.teaching_engine import mock_generate_teaching_turn

router = APIRouter()

class CreateSessionRequest(BaseModel):
    learner_profile: LearnerProfile
    current_topic: str

class UpdateStateRequest(BaseModel):
    state: PedagogicalState

class StudentInputRequest(BaseModel):
    student_input: str

@router.post("", response_model=TeachingSession, status_code=status.HTTP_201_CREATED)
async def create_session(request: CreateSessionRequest):
    new_session = TeachingSession(
        learner_profile=request.learner_profile,
        current_topic=request.current_topic,
        current_state=PedagogicalState.INIT
    )
    return await session_repo.create_session(new_session)

@router.get("/{session_id}", response_model=TeachingSession)
async def get_session(session_id: str):
    session = await session_repo.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session

# Basic state machine rules
VALID_TRANSITIONS = {
    PedagogicalState.INIT: [PedagogicalState.PLANNING],
    PedagogicalState.PLANNING: [PedagogicalState.TEACHING, PedagogicalState.QUESTIONING],
    PedagogicalState.TEACHING: [PedagogicalState.DEMONSTRATING, PedagogicalState.QUESTIONING, PedagogicalState.ASSESSING],
    PedagogicalState.DEMONSTRATING: [PedagogicalState.QUESTIONING, PedagogicalState.TEACHING],
    PedagogicalState.QUESTIONING: [PedagogicalState.EVALUATING],
    PedagogicalState.EVALUATING: [PedagogicalState.ADAPTING, PedagogicalState.ASSESSING, PedagogicalState.COMPLETED],
    PedagogicalState.ADAPTING: [PedagogicalState.TEACHING, PedagogicalState.DEMONSTRATING],
    PedagogicalState.ASSESSING: [PedagogicalState.COMPLETED, PedagogicalState.ADAPTING],
    PedagogicalState.COMPLETED: [PedagogicalState.INIT] # Can reset back to init
}

@router.patch("/{session_id}/state", response_model=TeachingSession)
async def update_session_state(session_id: str, request: UpdateStateRequest):
    session = await session_repo.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    
    current = session.current_state
    target = request.state
    
    if target not in VALID_TRANSITIONS.get(current, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Invalid state transition from {current.value} to {target.value}"
        )
        
    session.current_state = target
    session.updated_at = datetime.now(timezone.utc)
    
    return await session_repo.update_session(session)

@router.post("/{session_id}/interact", status_code=status.HTTP_202_ACCEPTED)
async def post_interaction(session_id: str, request: StudentInputRequest):
    session = await session_repo.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    
    turn = InteractionTurn(
        turn_id=str(uuid.uuid4()),
        state=session.current_state,
        student_input=request.student_input
    )
    
    session.history.append(turn)
    session.updated_at = datetime.now(timezone.utc)
    await session_repo.update_session(session)
    return {"status": "accepted"}

@router.get("/{session_id}/stream")
async def stream_interaction(session_id: str):
    session = await session_repo.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    async def sse_generator():
        # Using mock_generate_teaching_turn to simulate the AI teacher
        async for chunk in mock_generate_teaching_turn(session_id):
            # Format strictly as SSE: data: ...\n\n
            yield f"data: {chunk}\n\n"
            
    return StreamingResponse(sse_generator(), media_type="text/event-stream")
