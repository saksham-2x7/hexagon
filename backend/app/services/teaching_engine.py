import os
import json
import uuid
from typing import AsyncGenerator, Optional
from dotenv import load_dotenv

from google import genai
from google.genai import types

from app.schemas.interaction import PedagogicalState, InteractionTurn
from app.repositories.session_repo import session_repo

from contracts.pedagogy.models import (
    PedagogicalEvaluation, 
    TeachingTurn, 
    UnderstandingStatus
)
from core.pedagogy.engine.router import AdaptiveRouter
from core.pedagogy.engine.assembler import TeachingTurnAssembler

# Ensure env is loaded so genai.Client() finds the key
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

client = genai.Client()

async def mock_generate_teaching_turn(session_id: str, student_input: Optional[str] = None) -> AsyncGenerator[str, None]:
    """
    The production integration of the AI Brain with the FastAPI SQLite datastore.
    """
    # 1. Fetch Session from DB
    session = await session_repo.get_session(session_id)
    if not session:
        yield json.dumps({"error": f"Session {session_id} not found"})
        return

    topic = session.current_topic
    app_profile = session.learner_profile
    from contracts.pedagogy.models import LearnerProfile as EngineProfile, EducationalLevel, LearningStyle
    level_map = {"beginner": EducationalLevel.BEGINNER, "intermediate": EducationalLevel.INTERMEDIATE, "advanced": EducationalLevel.ADVANCED}
    profile = EngineProfile(
        educational_level=level_map.get(app_profile.grade_or_level.value, EducationalLevel.BEGINNER),
        target_subject=app_profile.target_subject,
        available_time_minutes=app_profile.time_budget_minutes,
        preferred_language=app_profile.preferred_language,
        learning_style=LearningStyle.CONCEPTUAL
    )
    adaptive_transition = None

    # 2. Evaluate & Route if Student Input exists
    if student_input:
        session.current_state = PedagogicalState.EVALUATING
        
        eval_prompt = f"Topic: {topic}\nStudent Response: {student_input}"
        eval_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=eval_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PedagogicalEvaluation,
                system_instruction="You are a pedagogical evaluator assessing a student's answer.",
                temperature=0.2
            )
        )
        
        evaluation = eval_response.parsed
        if not evaluation:
            # Fallback in case of parsing failure
            evaluation = PedagogicalEvaluation(
                understanding_status=UnderstandingStatus.PARTIAL,
                confidence_score=0.5,
                pedagogical_rationale="Failsafe fallback due to parsing error."
            )
            
        adaptive_transition = AdaptiveRouter.evaluate_and_route(evaluation)

    # 3. Assemble & Teach
    session.current_state = PedagogicalState.TEACHING
    
    system_instruction = TeachingTurnAssembler.construct_llm_prompt(
        profile=profile,
        target_subject=topic,
        current_concept=topic, # Fallback to topic as concept
        adaptive_transition=adaptive_transition
    )
    
    turn_response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents="Generate the next teaching turn.",
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=TeachingTurn,
            system_instruction=system_instruction,
            temperature=0.7
        )
    )
    
    teaching_turn: TeachingTurn = turn_response.parsed
    if not teaching_turn:
        yield json.dumps({"error": "Failed to generate teaching turn"})
        return
        
    # Ensure UUIDs are set
    if not teaching_turn.turn_id:
        teaching_turn.turn_id = str(uuid.uuid4())
        
    # Safely enforce visual fallback based on policy
    teaching_turn = TeachingTurnAssembler.force_visual_intent_fallback(teaching_turn, topic)

    # 4. Persistence
    interaction = InteractionTurn(
        turn_id=teaching_turn.turn_id,
        state=session.current_state,
        spoken_text=teaching_turn.spoken_text,
        visual_intent=teaching_turn.visual_intent.model_dump() if teaching_turn.visual_intent else None,
        student_input=student_input
    )
    
    session.history.append(interaction)
    await session_repo.update_session(session)

    # 5. Yield final JSON for SSE chunk
    yield teaching_turn.model_dump_json()
