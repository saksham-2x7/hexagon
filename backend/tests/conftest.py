import pytest
from unittest.mock import MagicMock
import app_core.llm_client

@pytest.fixture(autouse=True)
def mock_gemini(monkeypatch):
    monkeypatch.setattr(app_core.llm_client, "get_client", lambda: MagicMock())
    
    def mock_call(client, sys_instr, user_prompt, schema, model):
        schema_name = schema.__name__
        if schema_name == "LessonPlan":
            try:
                # Use model_construct to bypass validation
                nodes = [
                    schema.model_fields["nodes"].annotation.__args__[0].model_construct(
                        concept_name="Gravity", include_assessment_question=True
                    ),
                    schema.model_fields["nodes"].annotation.__args__[0].model_construct(
                        concept_name="Inertia", include_assessment_question=True
                    )
                ]
                return schema.model_construct(nodes=nodes)
            except:
                pass
        elif schema_name == "GeneratedQuestion":
            return schema.model_construct(question_text="What is gravity?", expected_ideal_answer="A force.")
        elif schema_name == "TeachingSegment":
            return schema.model_construct(spoken_script="Hello, let's learn.", visuals=[])
        elif schema_name == "LearningReport":
            return schema.model_construct(overall_score_percentage=100, summary="Good job", recommended_next_steps=[], strong_areas=[], concepts_to_revise=[], suggested_next_topic="None", closing_teacher_script="Bye")
        elif schema_name == "LessonConcept":
            return schema.model_construct(name="Dummy", importance=1)
        elif schema_name == "EvaluationResult":
            return schema.model_construct(is_correct=True, feedback_to_student="Good!", hidden_pedagogical_analysis="Analyzed", misconception_detected=None)
        
        return schema.model_construct()
        
    monkeypatch.setattr(app_core.llm_client, "_call_gemini_structured", mock_call)
