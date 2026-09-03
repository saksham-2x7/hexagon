import sys
import os

# Add the root directory to path to allow absolute imports within the backend package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.explanation_generator import generate_teaching_segment

def test_explanation():
    print("--- Testing AI Explanation Generator Module ---")
    try:
        # Dummy node based on Milestone 2 output
        node = {
            "concept_name": "Newton's First Law: The Law of Inertia",
            "explanation_depth": "detailed",
            "suggested_visual_type": "real-world-image"
        }
        learner_level = "Beginner"

        print(f"Requesting teaching segment for: '{node['concept_name']}'...")
        
        segment = generate_teaching_segment(
            node=node,
            learner_level=learner_level
        )
        
        print("\n✅ SUCCESS: Generated Teaching Segment!")
        print(segment.model_dump_json(indent=2))
    
    except Exception as e:
        raise e


