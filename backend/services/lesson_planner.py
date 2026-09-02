from pydantic import BaseModel, Field
from typing import List
from core.llm_client import generate_structured_output

class LessonNode(BaseModel):
    concept_name: str = Field(..., description="The core concept to be taught in this segment.")
    explanation_depth: str = Field(..., description="Required depth (e.g., 'surface-level', 'brief', 'detailed', 'highly-technical').")
    suggested_visual_type: str = Field(..., description="Recommended visual aid (e.g., 'diagram', 'equation', 'bullet-points', 'real-world-image', 'none').")
    include_assessment_question: bool = Field(..., description="True if the teacher should ask an interactive assessment question after this concept.")

class LessonPlan(BaseModel):
    topic: str = Field(..., description="The overall topic being taught.")
    target_audience_level: str = Field(..., description="The targeted learner profile (e.g., beginner, advanced).")
    estimated_duration_minutes: int = Field(..., description="The requested duration of the lesson.")
    nodes: List[LessonNode] = Field(..., description="The chronological sequence of concepts to teach.")

SYSTEM_PROMPT_TEMPLATE = """You are an expert curriculum designer and AI teaching strategist. Your task is to design a high-level lesson plan for an AI Teacher avatar to execute. 

You will receive a Topic, the Learner's Knowledge Level, and the Time Available.

RULES:
1. TIME ADAPTATION: If time is short (e.g., < 10 mins), limit the number of nodes to 2-3 core concepts with 'brief' explanations. If time is long, generate a comprehensive sequence with 'detailed' depths and frequent assessment questions. Ensure the number of nodes reasonably fits the requested time limit.
2. AUDIENCE ADAPTATION: If the learner is a beginner, use intuitive visual suggestions (diagrams, real-world images) and avoid highly-technical depths. If advanced, suggest equations, code snippets, or complex diagrams.
3. OUTPUT: DO NOT write the actual spoken teaching script. ONLY output the structural blueprint mapping out the sequence of concepts.

LANGUAGE RULE:
You must plan the lesson considering the requested language: {teaching_language}. However, to prevent breaking downstream frontend systems, you MUST keep all JSON keys, internal conceptual metadata (`concept_name`), and visual instructions (`suggested_visual_type`) STRICTLY in English."""

def generate_lesson_plan(topic: str, learner_level: str, time_available_minutes: int, teaching_language: str = "English") -> LessonPlan:
    user_prompt = f"Topic: {topic}\nLearner Level: {learner_level}\nTime Available: {time_available_minutes} minutes\nTeaching Language: {teaching_language}"
    
    return generate_structured_output(
        system_instruction=SYSTEM_PROMPT_TEMPLATE.format(teaching_language=teaching_language),
        user_prompt=user_prompt,
        schema=LessonPlan
    )
