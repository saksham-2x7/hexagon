import sys
import os

# Add the root directory to path to allow absolute imports within the backend package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.lesson_planner import generate_lesson_plan

def test_planner():
    print("--- Testing AI Lesson Planner Module ---")
    try:
        topic = "Newton's Laws"
        learner_level = "Beginner"
        time_available = 15

        print(f"Requesting lesson plan for: Topic='{topic}', Level='{learner_level}', Time={time_available}m...")
        
        plan = generate_lesson_plan(
            topic=topic,
            learner_level=learner_level,
            time_available_minutes=time_available
        )
        
        print("\n✅ SUCCESS: Generated Lesson Plan Blueprint!")
        print(plan.model_dump_json(indent=2))
    
    except Exception as e:
        raise e


