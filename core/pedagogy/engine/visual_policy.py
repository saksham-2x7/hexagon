import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from contracts.pedagogy.models import VisualIntentType

VISUAL_DISPATCH_PROMPT = """
You must select a `visual_intent` type that matches the current subject matter and explanation context.
Follow these rigid guidelines:
- If the explanation involves mathematical derivation, physics formulas, or algebraic steps, use `equation`.
- If the explanation involves biological processes, physical systems, architectural diagrams, or block diagrams, use `diagram_ref`.
- If the explanation involves programming logic, syntax, or pseudo-code, use `code`.
- If the explanation involves historical events, sequences, or chronological narratives, use `timeline`.
- Otherwise, if no specialized visual is required, default to `text`.
"""

def determine_visual_intent_type(subject: str) -> VisualIntentType:
    """
    Deterministic fallback map if the LLM isn't trusted or we want to force a visual type based on the subject.
    """
    subject_lower = subject.lower()
    
    if any(s in subject_lower for s in ["math", "physics formula", "algebra", "calculus"]):
        return VisualIntentType.EQUATION
    elif any(s in subject_lower for s in ["biology", "physics process", "architecture", "system design", "physics"]):
        return VisualIntentType.DIAGRAM_REF
    elif any(s in subject_lower for s in ["programming", "computer science", "coding", "software"]):
        return VisualIntentType.CODE
    elif any(s in subject_lower for s in ["history", "events", "chronology"]):
        return VisualIntentType.TIMELINE
    else:
        return VisualIntentType.TEXT
