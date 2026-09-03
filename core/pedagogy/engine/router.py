import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from contracts.pedagogy.models import (
    PedagogicalEvaluation,
    AdaptiveTransition,
    NextAction,
    UnderstandingStatus,
    MisconceptionType
)

class AdaptiveRouter:
    @staticmethod
    def evaluate_and_route(evaluation: PedagogicalEvaluation) -> AdaptiveTransition:
        # 1. Low Confidence Escape Hatch
        if evaluation.confidence_score < 0.6:
            return AdaptiveTransition(
                next_action=NextAction.PROVIDE_SIMPLIFIED_EXAMPLE,
                adaptation_context="The evaluator had low confidence. Fall back to a simplified example to gauge understanding better."
            )
        
        # 2. Perfect Understanding
        if evaluation.understanding_status == UnderstandingStatus.UNDERSTOOD:
            return AdaptiveTransition(
                next_action=NextAction.PROCEED_NEXT_CONCEPT,
                adaptation_context="Student demonstrated clear understanding. Proceed to the next concept in the module."
            )
        
        # 3. Handle Misconceptions or Partial Understanding based on the taxonomy
        if evaluation.misconception_type == MisconceptionType.MISSING_PREREQUISITE:
            return AdaptiveTransition(
                next_action=NextAction.BREAK_DOWN_PREREQUISITE,
                adaptation_context=f"Student lacks prerequisite knowledge. Detail: {evaluation.detected_gap_or_misconception}"
            )
        
        elif evaluation.misconception_type == MisconceptionType.CONCEPTUAL_FLAW:
            return AdaptiveTransition(
                next_action=NextAction.REEXPLAIN_WITH_ANALOGY,
                adaptation_context=f"Student has a conceptual flaw. Address with a targeted analogy. Detail: {evaluation.detected_gap_or_misconception}"
            )
            
        elif evaluation.misconception_type == MisconceptionType.FACTUAL_ERROR:
            return AdaptiveTransition(
                next_action=NextAction.PROVIDE_SIMPLIFIED_EXAMPLE,
                adaptation_context=f"Student made a factual error. Clarify with a simple, direct example. Detail: {evaluation.detected_gap_or_misconception}"
            )
            
        elif evaluation.misconception_type == MisconceptionType.OVERGENERALIZATION:
            return AdaptiveTransition(
                next_action=NextAction.CHALLENGE_DEEPER,
                adaptation_context=f"Student overgeneralized the concept. Challenge them to find edge cases. Detail: {evaluation.detected_gap_or_misconception}"
            )
            
        elif evaluation.misconception_type == MisconceptionType.OFF_TOPIC or evaluation.understanding_status == UnderstandingStatus.OFF_TOPIC:
            return AdaptiveTransition(
                next_action=NextAction.PROCEED_NEXT_CONCEPT,
                adaptation_context="Student is off topic. Gently guide them back to the current concept."
            )
            
        # 4. Fallback for Partial understanding without a specific taxonomy match
        if evaluation.understanding_status == UnderstandingStatus.PARTIAL:
            return AdaptiveTransition(
                next_action=NextAction.REEXPLAIN_WITH_ANALOGY,
                adaptation_context="Student partially understands. Reinforce with a different perspective or analogy."
            )
            
        # Default Fallback
        return AdaptiveTransition(
            next_action=NextAction.PROVIDE_SIMPLIFIED_EXAMPLE,
            adaptation_context="Fallback action triggered."
        )
