import sys
import os
import asyncio
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.core.database import DocumentStore
from app.schemas.learner import LearnerProfile, GradeLevel
from app.schemas.session import TeachingSession
from app.repositories.session_repo import session_repo
from app.services.teaching_engine import mock_generate_teaching_turn

async def main():
    print("--- Testing Live Teaching Engine Pipeline ---")
    
    # Initialize SQLite test DB
    await DocumentStore.init_db()
    
    # Create a mock session using app schema
    profile = LearnerProfile(
        student_id="test_student_123",
        grade_or_level=GradeLevel.BEGINNER,
        target_subject="Physics - Gravity",
        time_budget_minutes=15,
        preferred_language="Hinglish",
        preferred_style="conceptual"
    )
    
    new_session = TeachingSession(
        learner_profile=profile,
        current_topic="Gravity"
    )
    
    # Save to SQLite
    saved_session = await session_repo.create_session(new_session)
    session_id = saved_session.session_id
    
    print(f"Created Session ID: {session_id}")
    
    student_input = "Gravity is just magnetism from the earth's core"
    print(f"\nStudent Input: '{student_input}'")
    
    print("\nRunning Engine (Evaluation -> Routing -> Assembly -> Generation)...")
    
    # Consume the async generator
    async for chunk in mock_generate_teaching_turn(session_id, student_input):
        print("\n✅ Yielded SSE Chunk:")
        # Prove it's a valid JSON string by loading it
        parsed_chunk = json.loads(chunk)
        print(json.dumps(parsed_chunk, indent=2))
        
    # Verify it was saved to DB
    updated_session = await session_repo.get_session(session_id)
    print(f"\nDB Verification: Session history length is now {len(updated_session.history)}")

if __name__ == "__main__":
    asyncio.run(main())
