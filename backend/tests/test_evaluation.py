import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.evaluation_service import generate_question, evaluate_answer

def test_evaluation():
    print("--- Testing AI Interactive Evaluation Module ---")
    try:
        concept = "Newton's First Law: The Law of Inertia (An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an unbalanced force like friction)"
        learner_level = "Beginner"

        print("\n1. Generating Question...")
        question_data = generate_question(concept_context=concept, learner_level=learner_level)
        print(f"Question: {question_data.question_text}")
        print(f"Ideal Answer: {question_data.expected_ideal_answer}")

        print("\n2. Evaluating Mock Student Answer...")
        mock_student_answer = "An object in motion will just eventually stop on its own because it runs out of energy"
        print(f"Student said: '{mock_student_answer}'")
        
        evaluation = evaluate_answer(
            question=question_data.question_text,
            expected_answer=question_data.expected_ideal_answer,
            student_answer=mock_student_answer,
            concept_context=concept,
            learner_level=learner_level
        )
        
        print("\n✅ SUCCESS: Generated Evaluation Result!")
        print(evaluation.model_dump_json(indent=2))
    
    except Exception as e:
        raise e


