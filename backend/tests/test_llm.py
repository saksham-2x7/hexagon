import sys
import os

# Add backend to path for direct execution
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pydantic import BaseModel, Field
from app.core.llm_client import generate_structured_output

# 1. Define a dummy schema
class LessonConcept(BaseModel):
    concept_name: str = Field(..., description="The name of the concept being taught")
    explanation: str = Field(..., description="A short explanation of the concept")
    difficulty: int = Field(..., description="Difficulty level from 1 to 10")

def main():
    system_instruction = "You are an expert AI teacher."
    user_prompt = "Explain the concept of 'Gravity' to a beginner."

    print("--- Testing Gemini LLM Client ---")
    try:
        # 2. Call the function
        result = generate_structured_output(
            system_instruction=system_instruction,
            user_prompt=user_prompt,
            schema=LessonConcept
        )
        
        # 3. Print the verified Pydantic model
        print("\n✅ SUCCESS: LLM returned valid structured JSON!")
        print(result.model_dump_json(indent=2))
    
    except ValueError as ve:
        print(f"\n⚠️ GRACEFUL FAILURE (Expected if no API key): {str(ve)}")
    except Exception as e:
        print(f"\n❌ FAILURE: {str(e)}")

if __name__ == "__main__":
    main()
