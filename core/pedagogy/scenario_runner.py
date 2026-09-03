import sys
import os
import json
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from contracts.pedagogy.models import (
    LearnerProfile,
    LessonPlan,
    Module,
    TeachingTurn,
    StudentTurn,
    PedagogicalEvaluation,
    AdaptiveTransition,
    UnderstandingStatus,
    MisconceptionType,
    VisualIntent,
    VisualIntentType,
    InteractivePrompt,
    PromptType,
    ResponseType,
    NextAction
)
from contracts.pedagogy.state_machine import TeachingStateMachine, TeachingState
from core.pedagogy.engine.router import AdaptiveRouter

def run_golden_scenario():
    # 1. Initialize State and Context
    session_trace = []
    
    def log_event(event_type: str, data: dict):
        session_trace.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_type": event_type,
            "data": data
        })

    fsm = TeachingStateMachine(initial_state=TeachingState.IDLE)
    log_event("FSM_INIT", {"state": fsm.current_state.value})
    
    profile = LearnerProfile(
        educational_level="BEGINNER",
        target_subject="Physics - Electricity",
        available_time_minutes=20,
        preferred_language="Hinglish",
        learning_style="CONCEPTUAL"
    )
    
    plan = LessonPlan(
        topic="Ohm's Law",
        overview="Intro to V, I, and R",
        target_duration_minutes=20,
        modules=[
            Module(id="mod_1", title="Voltage and Resistance", concepts=["voltage", "resistance", "current_effect"], estimated_time_minutes=10)
        ]
    )
    
    log_event("SESSION_START", {"profile": profile.model_dump(), "lesson_plan": plan.model_dump()})
    
    # --- STEP 1: PLANNING -> TEACHING ---
    fsm.transition_to(TeachingState.PLANNING)
    log_event("FSM_TRANSITION", {"new_state": fsm.current_state.value})
    
    fsm.transition_to(TeachingState.TEACHING)
    log_event("FSM_TRANSITION", {"new_state": fsm.current_state.value})
    
    turn_1 = TeachingTurn(
        turn_id="t_1",
        module_id="mod_1",
        concept_id="current_effect",
        spoken_text="Voltage is the push, resistance is the block. Agar resistance badh gaya, toh current ka kya hoga?",
        visual_intent=VisualIntent(type=VisualIntentType.TEXT, payload="Voltage (Push) vs Resistance (Block)"),
        interactive_prompt=InteractivePrompt(
            prompt_type=PromptType.CONCEPT_CHECK,
            question_text="What happens to current if resistance increases?"
        )
    )
    log_event("TEACHING_TURN_EMITTED", turn_1.model_dump())
    
    # --- STEP 2: WAITING_FOR_STUDENT ---
    fsm.transition_to(TeachingState.WAITING_FOR_STUDENT)
    log_event("FSM_TRANSITION", {"new_state": fsm.current_state.value})
    
    student_1 = StudentTurn(
        turn_id="t_1",
        response_text="Current increases.",
        response_type=ResponseType.TEXT,
        timestamp=datetime.now(timezone.utc)
    )
    log_event("STUDENT_TURN_RECEIVED", student_1.model_dump())
    
    # --- STEP 3: EVALUATING ---
    fsm.transition_to(TeachingState.EVALUATING)
    log_event("FSM_TRANSITION", {"new_state": fsm.current_state.value})
    
    eval_1 = PedagogicalEvaluation(
        understanding_status=UnderstandingStatus.MISCONCEPTION,
        misconception_type=MisconceptionType.CONCEPTUAL_FLAW,
        detected_gap_or_misconception="Thinks more resistance means more current.",
        confidence_score=0.95,
        pedagogical_rationale="Directly contradicted the inverse relationship."
    )
    log_event("EVALUATION_COMPLETED", eval_1.model_dump())
    
    # --- STEP 4: ADAPTING -> TEACHING ---
    fsm.transition_to(TeachingState.ADAPTING)
    log_event("FSM_TRANSITION", {"new_state": fsm.current_state.value})
    
    adaptation = AdaptiveRouter.evaluate_and_route(eval_1)
    log_event("ADAPTATION_GENERATED", adaptation.model_dump())
    
    fsm.transition_to(TeachingState.TEACHING)
    log_event("FSM_TRANSITION", {"new_state": fsm.current_state.value})
    
    turn_2 = TeachingTurn(
        turn_id="t_2",
        module_id="mod_1",
        concept_id="current_effect_reexplained",
        spoken_text="Socho pipe mein kachra (resistance) phasa hai. Agar kachra badhega, toh paani (current) kam nikalega na?",
        visual_intent=VisualIntent(type=VisualIntentType.DIAGRAM_REF, payload="water_pipe_blockage"),
        interactive_prompt=InteractivePrompt(
            prompt_type=PromptType.CONCEPT_CHECK,
            question_text="So if resistance increases, what happens to current?"
        )
    )
    log_event("TEACHING_TURN_EMITTED", turn_2.model_dump())
    
    # --- STEP 5: WAITING_FOR_STUDENT ---
    fsm.transition_to(TeachingState.WAITING_FOR_STUDENT)
    log_event("FSM_TRANSITION", {"new_state": fsm.current_state.value})
    
    student_2 = StudentTurn(
        turn_id="t_2",
        response_text="Current decreases.",
        response_type=ResponseType.TEXT,
        timestamp=datetime.now(timezone.utc)
    )
    log_event("STUDENT_TURN_RECEIVED", student_2.model_dump())
    
    # --- STEP 6: EVALUATING -> PLANNING ---
    fsm.transition_to(TeachingState.EVALUATING)
    log_event("FSM_TRANSITION", {"new_state": fsm.current_state.value})
    
    eval_2 = PedagogicalEvaluation(
        understanding_status=UnderstandingStatus.UNDERSTOOD,
        misconception_type=None,
        detected_gap_or_misconception=None,
        confidence_score=0.99,
        pedagogical_rationale="Student correctly identified current decreases."
    )
    log_event("EVALUATION_COMPLETED", eval_2.model_dump())
    
    fsm.transition_to(TeachingState.ADAPTING) # Need to route first
    log_event("FSM_TRANSITION", {"new_state": fsm.current_state.value})
    
    adaptation_2 = AdaptiveRouter.evaluate_and_route(eval_2)
    log_event("ADAPTATION_GENERATED", adaptation_2.model_dump())
    
    fsm.transition_to(TeachingState.PLANNING)
    log_event("FSM_TRANSITION", {"new_state": fsm.current_state.value})
    
    # --- EXPORT ---
    output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'golden_trace.json'))
    with open(output_path, "w") as f:
        json.dump(session_trace, f, indent=2, default=str)
        
    print(f"Successfully exported {len(session_trace)} events to {output_path}")

if __name__ == "__main__":
    run_golden_scenario()
