import json
import pytest
from pydantic import ValidationError

from contracts.pedagogy.models import (
    PedagogicalEvaluation,
    NextAction,
    UnderstandingStatus,
    MisconceptionType
)
from contracts.pedagogy.state_machine import TeachingStateMachine, TeachingState
from core.pedagogy.engine.router import AdaptiveRouter

def test_engine_scenario_correct():
    # 1. Mock JSON output from LLM
    mock_json = """
    {
      "understanding_status": "UNDERSTOOD",
      "misconception_type": null,
      "detected_gap_or_misconception": null,
      "confidence_score": 0.95,
      "pedagogical_rationale": "Student perfectly mapped increased pressure to increased current."
    }
    """
    
    # 2. Validate through Pydantic
    data = json.loads(mock_json)
    evaluation = PedagogicalEvaluation(**data)
    assert evaluation.understanding_status == UnderstandingStatus.UNDERSTOOD
    
    # 3. Pass through AdaptiveRouter
    transition = AdaptiveRouter.evaluate_and_route(evaluation)
    assert transition.next_action == NextAction.PROCEED_NEXT_CONCEPT
    
    # 4. Verify FSM transitions
    fsm = TeachingStateMachine(initial_state=TeachingState.WAITING_FOR_STUDENT)
    fsm.transition_to(TeachingState.EVALUATING)
    fsm.transition_to(TeachingState.ADAPTING)
    assert fsm.current_state == TeachingState.ADAPTING


def test_engine_scenario_conceptual_misunderstanding():
    mock_json = """
    {
      "understanding_status": "MISCONCEPTION",
      "misconception_type": "CONCEPTUAL_FLAW",
      "detected_gap_or_misconception": "Thinks voltage is the volume of water, not the pressure.",
      "confidence_score": 0.88,
      "pedagogical_rationale": "The student conflated voltage with quantity of charge rather than electromotive force."
    }
    """
    
    evaluation = PedagogicalEvaluation(**json.loads(mock_json))
    assert evaluation.misconception_type == MisconceptionType.CONCEPTUAL_FLAW
    
    transition = AdaptiveRouter.evaluate_and_route(evaluation)
    assert transition.next_action == NextAction.REEXPLAIN_WITH_ANALOGY
    assert "conceptual flaw" in transition.adaptation_context


def test_engine_scenario_off_topic():
    mock_json = """
    {
      "understanding_status": "OFF_TOPIC",
      "misconception_type": "OFF_TOPIC",
      "detected_gap_or_misconception": "Asked about quantum mechanics instead of Ohm's Law.",
      "confidence_score": 0.99,
      "pedagogical_rationale": "Student completely ignored the question about voltage."
    }
    """
    
    evaluation = PedagogicalEvaluation(**json.loads(mock_json))
    assert evaluation.understanding_status == UnderstandingStatus.OFF_TOPIC
    
    transition = AdaptiveRouter.evaluate_and_route(evaluation)
    # The router rules state off-topic should PROCEED_NEXT_CONCEPT (meaning guide back to topic)
    assert transition.next_action == NextAction.PROCEED_NEXT_CONCEPT
    assert "off topic" in transition.adaptation_context

def test_engine_scenario_low_confidence():
    mock_json = """
    {
      "understanding_status": "PARTIAL",
      "misconception_type": null,
      "detected_gap_or_misconception": "Unclear answer, could be guessing.",
      "confidence_score": 0.45,
      "pedagogical_rationale": "Audio transcript was garbled, hard to evaluate."
    }
    """
    
    evaluation = PedagogicalEvaluation(**json.loads(mock_json))
    
    transition = AdaptiveRouter.evaluate_and_route(evaluation)
    # Router should catch low confidence and output PROVIDE_SIMPLIFIED_EXAMPLE
    assert transition.next_action == NextAction.PROVIDE_SIMPLIFIED_EXAMPLE
    assert "low confidence" in transition.adaptation_context
