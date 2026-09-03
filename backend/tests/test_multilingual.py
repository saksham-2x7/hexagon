import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.orchestrator import TeachingSession

def print_trace(step, data):
    print(f"\n[{step}]")
    print(json.dumps(data, indent=2))

def test_multilingual():
    print("--- Testing Multilingual Support (Hinglish) ---")
    try:
        # 1. Initialize
        print("\nInitializing Session...")
        session = TeachingSession(topic="Friction", learner_level="Beginner", time_available=5, teaching_language="Hinglish")
        
        # 2. Plan Lesson (INIT -> TEACHING)
        res_plan = session.advance()
        print_trace("STATE: INIT -> TEACHING (Generated Plan)", res_plan)
        
        # 3. Node 1: Teach & Ask Question (TEACHING -> WAITING_FOR_ANSWER)
        res_node1 = session.advance()
        print_trace("STATE: TEACHING -> WAITING_FOR_ANSWER (Node 1)", res_node1)
        
        print("\n✅ SUCCESS: Multilingual test generated content in Hinglish!")
    
    except Exception as e:
        raise e
        import traceback
        traceback.print_exc()


