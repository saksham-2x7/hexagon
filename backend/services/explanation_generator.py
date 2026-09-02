from pydantic import BaseModel, Field
from typing import List, Dict, Any
from core.llm_client import generate_structured_output

class TeachingSegment(BaseModel):
    spoken_script: str = Field(..., description="The conversational, empathetic spoken dialogue for the AI avatar to say.")
    on_screen_text: List[str] = Field(..., description="Short, punchy bullet points to display on the screen (3-5 words max each).")
    visual_description: str = Field(..., description="Detailed instructions for the frontend on exactly what visual (image, diagram, equation) to render.")

SYSTEM_PROMPT = """You are a warm, engaging, and expert AI Teacher. Your task is to take a single lesson concept and generate the teaching materials for a specific segment.

RULES:
1. TONE & PERSONA: The `spoken_script` MUST sound like a highly encouraging human teacher speaking directly to a student. Use natural pacing, engaging hooks, and relatable analogies tailored to the learner's level. NEVER sound robotic, encyclopedic, or like a textbook.
2. MODALITY SEPARATION: The spoken script must NOT just read the on-screen text word-for-word. The `on_screen_text` should be very short, punchy takeaways, while the `spoken_script` elaborates on them conversationally.
3. VISUALS & DEPTH: Provide a vivid `visual_description` based strictly on the requested visual type. Ensure the length and complexity of your explanation matches the requested explanation depth.
4. FOCUS: Only teach the specific concept provided."""

def generate_teaching_segment(node: Dict[str, Any], learner_level: str) -> TeachingSegment:
    user_prompt = (
        f"Concept: {node.get('concept_name')}\n"
        f"Learner Level: {learner_level}\n"
        f"Explanation Depth: {node.get('explanation_depth')}\n"
        f"Requested Visual Type: {node.get('suggested_visual_type')}"
    )
    
    return generate_structured_output(
        system_instruction=SYSTEM_PROMPT,
        user_prompt=user_prompt,
        schema=TeachingSegment
    )
