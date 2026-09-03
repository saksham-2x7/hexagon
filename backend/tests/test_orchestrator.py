import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.orchestrator import TeachingSession

def print_trace(step, data):
    print(f"\n[{step}]")
    print(json.dumps(data, indent=2))

def main():
    print("--- Testing Adaptive Orchestrator (Core Loop) ---")
    try:
        # 1. Initialize
        print("\nInitializing Session...")
        session = TeachingSession(topic="Gravity", learner_level="Beginner", time_available=5)
        
        # 2. Plan Lesson (INIT -> TEACHING)
        res_plan = session.advance()
        print_trace("STATE: INIT -> TEACHING (Generated Plan)", res_plan)
        
        # 3. Node 1: Teach & Ask Question (TEACHING -> WAITING_FOR_ANSWER)
        res_node1 = session.advance()
        print_trace("STATE: TEACHING -> WAITING_FOR_ANSWER (Node 1)", res_node1)
        
        # 4. Node 1: Process CORRECT Answer (WAITING_FOR_ANSWER -> FEEDBACK)
        mock_correct = "Gravity is an invisible force that pulls things down to the ground."
        print(f"\n> Student Answers: '{mock_correct}'")
        res_fb1 = session.advance(student_answer=mock_correct)
        print_trace("STATE: WAITING_FOR_ANSWER -> FEEDBACK (Node 1 Feedback)", res_fb1)
        
        # 5. Node 2: Teach & Ask Question (FEEDBACK -> TEACHING -> WAITING_FOR_ANSWER)
        res_node2 = session.advance()
        print_trace("STATE: FEEDBACK -> TEACHING -> WAITING_FOR_ANSWER (Node 2)", res_node2)
        
        # 6. Node 2: Process INCORRECT Answer (WAITING_FOR_ANSWER -> FEEDBACK)
        mock_incorrect = "Gravity is magnetism caused by the Earth's metal core."
        print(f"\n> Student Answers: '{mock_incorrect}'")
        res_fb2 = session.advance(student_answer=mock_incorrect)
        print_trace("STATE: WAITING_FOR_ANSWER -> FEEDBACK (Node 2 Feedback)", res_fb2)
        
        # 7. Complete Lesson (FEEDBACK -> COMPLETED)
        while session.current_state != "COMPLETED":
            res_end = session.advance()
            print_trace(f"STATE: -> {session.current_state}", res_end)

        print("\n✅ SUCCESS: Full pedagogical loop executed without getting stuck!")
        print("\nFinal State Dump (Ready for DB):")
        print(json.dumps(session.to_dict(), indent=2))
    
    except Exception as e:
        print(f"\n❌ FAILURE: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
