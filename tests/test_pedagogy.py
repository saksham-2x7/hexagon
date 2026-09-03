import json
import os
import pytest
from pydantic import ValidationError

from contracts.pedagogy.models import (
    LearnerProfile,
    LessonPlan,
    TeachingTurn,
    StudentTurn,
    PedagogicalEvaluation,
    AdaptiveTransition
)
from contracts.pedagogy.state_machine import TeachingStateMachine, TeachingState, InvalidTransitionError

FIXTURE_PATH = os.path.join(os.path.dirname(__file__), "..", "fixtures", "ohm_law_session.json")

def load_fixture():
    with open(FIXTURE_PATH, "r") as f:
        return json.load(f)

def test_models_with_fixture():
    data = load_fixture()
    
    # Validate each model
    profile = LearnerProfile(**data["learner_profile"])
    assert profile.educational_level == "BEGINNER"
    assert profile.preferred_language == "hinglish"
    
    plan = LessonPlan(**data["lesson_plan"])
    assert len(plan.modules) == 2
    assert plan.modules[0].id == "mod_1"
    
    turn = TeachingTurn(**data["teaching_turn"])
    assert turn.visual_intent.type == "text"
    assert turn.interactive_prompt.prompt_type == "concept_check"
    
    student_turn = StudentTurn(**data["student_turn"])
    assert student_turn.response_type == "text"
    
    evaluation = PedagogicalEvaluation(**data["evaluation"])
    assert evaluation.understanding_status == "UNDERSTOOD"
    assert evaluation.confidence_score == 0.95
    
    adaptation = AdaptiveTransition(**data["adaptation"])
    assert adaptation.next_action == "PROCEED_NEXT_CONCEPT"

def test_state_machine_valid_transitions():
    fsm = TeachingStateMachine()
    
    assert fsm.current_state == TeachingState.IDLE
    
    # Valid flow
    fsm.transition_to(TeachingState.PLANNING)
    assert fsm.current_state == TeachingState.PLANNING
    
    fsm.transition_to(TeachingState.TEACHING)
    fsm.transition_to(TeachingState.WAITING_FOR_STUDENT)
    fsm.transition_to(TeachingState.EVALUATING)
    fsm.transition_to(TeachingState.ADAPTING)
    fsm.transition_to(TeachingState.TEACHING)
    
    # Finish lesson
    fsm.transition_to(TeachingState.COMPLETED)
    assert fsm.current_state == TeachingState.COMPLETED

def test_state_machine_invalid_transitions():
    fsm = TeachingStateMachine()
    
    # Cannot jump from IDLE to TEACHING
    with pytest.raises(InvalidTransitionError):
        fsm.transition_to(TeachingState.TEACHING)
        
    fsm.transition_to(TeachingState.PLANNING)
    fsm.transition_to(TeachingState.TEACHING)
    
    # Cannot jump from TEACHING to ADAPTING without EVALUATING
    with pytest.raises(InvalidTransitionError):
        fsm.transition_to(TeachingState.ADAPTING)
        
    # Cannot jump from TEACHING to COMPLETED? Actually we allow TEACHING -> COMPLETED
    # Let's verify we allowed it in state_machine.py: 
    # TeachingState.TEACHING: [TeachingState.WAITING_FOR_STUDENT, TeachingState.COMPLETED]
    fsm.transition_to(TeachingState.COMPLETED)
    
    # From COMPLETED, we cannot go anywhere
    with pytest.raises(InvalidTransitionError):
        fsm.transition_to(TeachingState.IDLE)
