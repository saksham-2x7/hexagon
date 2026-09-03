import sys
import os
import json
from dotenv import load_dotenv

from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential, RetryError

# Add the root directory to path to allow absolute imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from contracts.pedagogy.models import PedagogicalEvaluation

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

client = genai.Client()

SYSTEM_PROMPT = """You are an expert pedagogical evaluator. 
Topic: Gravity
Correct Concept: Gravity is an attractive force between all masses, pulling objects towards the Earth's center. It is distinctly different from magnetism.
Your task: Evaluate the student's response strictly according to the provided schema. Analyze their understanding, correctly classify any misconceptions, and provide a pedagogical rationale for your grading."""

class LLMValidationError(Exception):
    pass

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
def evaluate_student_input(student_input: str) -> PedagogicalEvaluation:
    print("  [API Call] Requesting evaluation from Gemini...")
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=f"Student Response: {student_input}",
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=PedagogicalEvaluation,
            system_instruction=SYSTEM_PROMPT,
            temperature=0.2
        )
    )
    
    if not response.parsed:
        raise LLMValidationError("LLM hallucinated schema; response.parsed is None. Forcing retry.")
        
    return response.parsed

def main():
    print("--- Starting PedagogicalEvaluator Stress Test ---")
    student_input = "Gravity is just magnetism from the earth's core"
    print(f"Edge Case Input: '{student_input}'\n")
    
    success_count = 0
    total_runs = 5
    
    for i in range(total_runs):
        print(f"\n--- Iteration {i+1} ---")
        try:
            evaluation = evaluate_student_input(student_input)
            print(f"✅ Success on Iteration {i+1}!")
            print(evaluation.model_dump_json(indent=2))
            success_count += 1
        except RetryError as e:
            print(f"❌ Failed permanently on Iteration {i+1} after all retries: {e}")
        except Exception as e:
            print(f"❌ Unexpected Error on Iteration {i+1}: {e}")
            
    print("\n--- Stress Test Summary ---")
    print(f"Total Runs: {total_runs}")
    print(f"Successful Evaluations: {success_count}/{total_runs}")
    
if __name__ == "__main__":
    main()
