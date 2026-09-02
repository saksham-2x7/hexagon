import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.report_generator import generate_learning_report

def main():
    print("--- Testing Post-Lesson Assessment & Feedback Module ---")
    try:
        mock_session_state = {
            "topic": "Gravity",
            "learner_level": "Beginner",
            "teaching_language": "Hinglish",
            "strong_concepts": ["Definition of Gravity", "F=ma"],
            "weak_concepts": ["Difference between Mass and Weight"]
        }

        print(f"\nRequesting Final Learning Report for: {mock_session_state['topic']} (Language: {mock_session_state['teaching_language']})...")
        
        report = generate_learning_report(session_state_dict=mock_session_state)
        
        print("\n✅ SUCCESS: Generated Learning Report!")
        print(report.model_dump_json(indent=2))
    
    except Exception as e:
        print(f"\n❌ FAILURE: {str(e)}")

if __name__ == "__main__":
    main()
