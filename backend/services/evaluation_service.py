from pydantic import BaseModel, Field
from typing import Optional
from core.llm_client import generate_structured_output

class GeneratedQuestion(BaseModel):
    question_text: str = Field(..., description="The conversational spoken question posed to the student.")
    expected_ideal_answer: str = Field(..., description="The ideal, correct answer the teacher is looking for.")
    question_type: str = Field(..., description="Format of the question (e.g., 'short_answer', 'conceptual', 'real_world_application').")

class EvaluationResult(BaseModel):
    is_correct: bool = Field(..., description="True if the student's answer demonstrates sufficient core understanding.")
    misconception_detected: Optional[str] = Field(None, description="Explicitly names the mental model error or misconception if the answer is incorrect or partially correct.")
    teacher_feedback_script: str = Field(..., description="The warm, conversational, and empathetic spoken response from the AI avatar addressing the answer.")

QUESTION_SYSTEM_PROMPT = """You are an expert, engaging AI Teacher. Your task is to generate a single, thought-provoking question to test a student's understanding of a specific concept you just taught.
RULES:
1. Keep the question conversational and perfectly adapted to the learner's level.
2. Focus on conceptual understanding or real-world application, not just rote memorization or trivia.
3. Provide the ideal expected answer to serve as a grading rubric later."""

EVALUATOR_SYSTEM_PROMPT = """You are an empathetic, highly skilled AI Teacher evaluating a student's spoken response to your question. 
RULES:
1. MISCONCEPTION FOCUS: If the student is wrong, deeply analyze *why* they are wrong. Explicitly identify their flawed mental model in the `misconception_detected` field (e.g., 'Confusing friction with a natural loss of energy').
2. FEEDBACK TONE: Write the `teacher_feedback_script` exactly as you would speak it to the student. 
   - If correct: Praise them warmly and enthusiastically.
   - If incorrect: NEVER be condescending. Validate their thought process first (e.g., "I completely see why you'd think that! It happens every day.") then gently correct them using a relatable analogy.
3. INDEPENDENCE: The `teacher_feedback_script` must be standalone, spoken dialogue ready for the avatar to say out loud."""

def generate_question(concept_context: str, learner_level: str) -> GeneratedQuestion:
    user_prompt = f"Concept Taught: {concept_context}\nLearner Level: {learner_level}\nGenerate an assessment question."
    return generate_structured_output(
        system_instruction=QUESTION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        schema=GeneratedQuestion
    )

def evaluate_answer(question: str, expected_answer: str, student_answer: str, concept_context: str, learner_level: str) -> EvaluationResult:
    user_prompt = (
        f"Concept Context: {concept_context}\n"
        f"Learner Level: {learner_level}\n"
        f"Question Asked: {question}\n"
        f"Ideal Expected Answer: {expected_answer}\n"
        f"Student's Answer: {student_answer}\n"
        f"Evaluate the student's answer."
    )
    return generate_structured_output(
        system_instruction=EVALUATOR_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        schema=EvaluationResult
    )
