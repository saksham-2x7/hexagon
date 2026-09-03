import json
import pytest

from contracts.pedagogy.models import (
    LearnerProfile,
    AdaptiveTransition,
    NextAction,
    VisualIntentType
)
from core.pedagogy.engine.assembler import TeachingTurnAssembler

def test_assembler_scenario_a_math_equation():
    # Scenario A: Math lesson in English generating an equation visual intent
    profile = LearnerProfile(
        educational_level="BEGINNER",
        target_subject="Math - Calculus",
        available_time_minutes=30,
        preferred_language="English",
        learning_style="ANALYTICAL"
    )
    
    # Generate prompt to verify it compiles correctly
    prompt = TeachingTurnAssembler.construct_llm_prompt(
        profile=profile,
        target_subject="Math - Calculus",
        current_concept="Derivatives"
    )
    assert "conversational, and natural English" in prompt
    assert "If the explanation involves mathematical derivation" in prompt
    
    # Mock LLM JSON output that returns an equation
    mock_llm_output = """
    {
      "turn_id": "turn_math_1",
      "module_id": "mod_calc_1",
      "concept_id": "derivatives",
      "spoken_text": "The derivative represents the rate of change. Let's look at the power rule.",
      "visual_intent": {
        "type": "equation",
        "payload": "f'(x) = n*x^(n-1)"
      },
      "interactive_prompt": {
        "prompt_type": "concept_check",
        "question_text": "If f(x) = x^2, what is f'(x)?"
      }
    }
    """
    
    # Validate and Parse
    turn = TeachingTurnAssembler.validate_and_parse_llm_output(mock_llm_output)
    assert turn.visual_intent.type == VisualIntentType.EQUATION
    assert turn.interactive_prompt.prompt_type == "concept_check"
    
    # Ensure fallback doesn't overwrite a correct type
    turn_verified = TeachingTurnAssembler.force_visual_intent_fallback(turn, "Math - Calculus")
    assert turn_verified.visual_intent.type == VisualIntentType.EQUATION

def test_assembler_scenario_b_physics_hinglish_diagram():
    # Scenario B: A Physics concept re-explanation (adaptation) in Hinglish generating a diagram_ref
    profile = LearnerProfile(
        educational_level="INTERMEDIATE",
        target_subject="Physics - Circuits",
        available_time_minutes=20,
        preferred_language="Hinglish",
        learning_style="CONCEPTUAL"
    )
    
    adaptation = AdaptiveTransition(
        next_action=NextAction.REEXPLAIN_WITH_ANALOGY,
        adaptation_context="Student thinks voltage is volume. Re-explain using a water pressure diagram."
    )
    
    # Generate prompt
    prompt = TeachingTurnAssembler.construct_llm_prompt(
        profile=profile,
        target_subject="Physics - Circuits",
        current_concept="Voltage vs Current",
        adaptive_transition=adaptation
    )
    
    assert "Mix Hindi and English conversationally" in prompt
    assert "ADAPTATION TRIGGERED" in prompt
    assert "REEXPLAIN_WITH_ANALOGY" in prompt
    
    # Mock LLM Output
    mock_llm_output = """
    {
      "turn_id": "turn_phys_2",
      "module_id": "mod_circuits_1",
      "concept_id": "voltage_vs_current",
      "spoken_text": "Nahi, dekho. Voltage paani ki quantity nahi hai. Yeh ek pressure hai. Jaise is water tank diagram mein dekho.",
      "visual_intent": {
        "type": "diagram_ref",
        "payload": "water_tank_pressure_analogy"
      }
    }
    """
    
    turn = TeachingTurnAssembler.validate_and_parse_llm_output(mock_llm_output)
    assert turn.visual_intent.type == VisualIntentType.DIAGRAM_REF
    assert turn.spoken_text.startswith("Nahi, dekho.")
    
    turn_verified = TeachingTurnAssembler.force_visual_intent_fallback(turn, "Physics - Circuits")
    assert turn_verified.visual_intent.type == VisualIntentType.DIAGRAM_REF
