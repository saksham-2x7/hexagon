from pydantic import BaseModel, Field
from typing import List, Dict, Any
from core.llm_client import generate_structured_output

class LearningReport(BaseModel):
    overall_score_percentage: int = Field(..., description="A calculated percentage score (0-100) based on the ratio of strong vs. weak concepts.")
    strong_areas: List[str] = Field(..., description="List of concepts the student mastered.")
    concepts_to_revise: List[str] = Field(..., description="List of concepts the student struggled with.")
    suggested_next_topic: str = Field(..., description="A logical next educational topic to study based on this lesson.")
    closing_teacher_script: str = Field(..., description="The warm, encouraging spoken dialogue wrapping up the lesson.")

SYSTEM_PROMPT_TEMPLATE = """You are an encouraging, expert AI Teacher. A student has just completed a lesson with you. 
You will receive the Lesson Topic, the Concepts they mastered (Strong), and the Concepts they struggled with (Weak).

RULES:
1. SCORE & ANALYSIS: Calculate a logical `overall_score_percentage` based on the ratio of strong vs. weak concepts. Output the strong and weak areas clearly.
2. NEXT TOPIC: Suggest one highly relevant next topic for them to study.
3. TONE: The `closing_teacher_script` must be a warm, highly encouraging wrap-up speech. Praise their successes, gently mention what they should review, and get them excited for the next topic. NEVER be punitive.

LANGUAGE RULE:
You must generate the user-facing `closing_teacher_script` strictly in the requested language: {teaching_language}. 
However, you MUST keep all JSON keys and the textual data for `strong_areas`, `concepts_to_revise`, and `suggested_next_topic` STRICTLY in English for backend analytics tracking."""

def generate_learning_report(session_state_dict: Dict[str, Any]) -> LearningReport:
    teaching_language = session_state_dict.get("teaching_language", "English")
    user_prompt = (
        f"Topic: {session_state_dict.get('topic')}\n"
        f"Learner Level: {session_state_dict.get('learner_level')}\n"
        f"Strong Concepts: {session_state_dict.get('strong_concepts')}\n"
        f"Weak Concepts: {session_state_dict.get('weak_concepts')}\n"
    )
    
    return generate_structured_output(
        system_instruction=SYSTEM_PROMPT_TEMPLATE.format(teaching_language=teaching_language),
        user_prompt=user_prompt,
        schema=LearningReport
    )
