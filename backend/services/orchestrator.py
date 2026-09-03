from typing import Optional, Dict, Any
from .lesson_planner import generate_lesson_plan, LessonPlan
from .explanation_generator import generate_teaching_segment
from .evaluation_service import generate_question, evaluate_answer, GeneratedQuestion
from .report_generator import generate_learning_report

class TeachingSession:
    def __init__(self, topic: str, learner_level: str, time_available: int, teaching_language: str = "English"):
        self.topic = topic
        self.learner_level = learner_level
        self.time_available = time_available
        self.teaching_language = teaching_language
        self.current_state = "INIT"
        self.current_node_index = 0
        
        self.plan: Optional[LessonPlan] = None
        self.current_question: Optional[GeneratedQuestion] = None
        
        self.weak_concepts: list[str] = []
        self.strong_concepts: list[str] = []

    def advance(self, student_answer: Optional[str] = None) -> Dict[str, Any]:
        """The main loop the frontend calls to push the state machine forward."""
        if self.current_state == "INIT":
            self.plan = generate_lesson_plan(self.topic, self.learner_level, self.time_available, self.teaching_language)
            self.current_state = "TEACHING"
            return {"status": "lesson_planned", "plan": self.plan.model_dump()}

        elif self.current_state == "TEACHING":
            if not self.plan or self.current_node_index >= len(self.plan.nodes):
                self.current_state = "COMPLETED"
                return self._generate_report()

            node = self.plan.nodes[self.current_node_index]
            segment = generate_teaching_segment(node.model_dump(), self.learner_level, self.teaching_language)
            
            payload = {"status": "teaching", "segment": segment.model_dump(), "concept": node.concept_name}
            
            if node.include_assessment_question:
                self.current_question = generate_question(node.concept_name, self.learner_level, self.teaching_language)
                payload["question"] = self.current_question.model_dump()
                self.current_state = "WAITING_FOR_ANSWER"
            else:
                self.current_node_index += 1
                self.current_state = "FEEDBACK"  # Intermediate state to wait for user to click next

            return payload

        elif self.current_state == "WAITING_FOR_ANSWER":
            if not student_answer:
                raise ValueError("Student answer is required in WAITING_FOR_ANSWER state.")
            
            node = self.plan.nodes[self.current_node_index]
            eval_result = evaluate_answer(
                question=self.current_question.question_text,
                expected_answer=self.current_question.expected_ideal_answer,
                student_answer=student_answer,
                concept_context=node.concept_name,
                learner_level=self.learner_level,
                teaching_language=self.teaching_language
            )
            
            if eval_result.is_correct:
                self.strong_concepts.append(node.concept_name)
            else:
                self.weak_concepts.append(node.concept_name)
            
            self.current_node_index += 1
            self.current_state = "FEEDBACK"
            
            return {"status": "feedback_ready", "feedback": eval_result.model_dump()}

        elif self.current_state == "FEEDBACK":
            # User acknowledged feedback, move to next node
            if self.plan and self.current_node_index >= len(self.plan.nodes):
                self.current_state = "COMPLETED"
                return self._generate_report()
            else:
                self.current_state = "TEACHING"
                return self.advance()

        elif self.current_state == "COMPLETED":
            return self._generate_report()

    def _generate_report(self) -> Dict[str, Any]:
        report = generate_learning_report(self.to_dict())
        return {
            "status": "completed",
            "report": report.model_dump()
        }

    def to_dict(self) -> dict:
        """Serializes session state for database storage."""
        return {
            "topic": self.topic,
            "learner_level": self.learner_level,
            "time_available": self.time_available,
            "teaching_language": self.teaching_language,
            "current_state": self.current_state,
            "current_node_index": self.current_node_index,
            "plan": self.plan.model_dump() if self.plan else None,
            "current_question": self.current_question.model_dump() if self.current_question else None,
            "weak_concepts": self.weak_concepts,
            "strong_concepts": self.strong_concepts
        }

    @classmethod
    def from_dict(cls, data: dict) -> "TeachingSession":
        """Deserializes session state from the database."""
        session = cls(
            topic=data["topic"], 
            learner_level=data["learner_level"], 
            time_available=data["time_available"],
            teaching_language=data.get("teaching_language", "English")
        )
        session.current_state = data["current_state"]
        session.current_node_index = data["current_node_index"]
        if data.get("plan"): 
            session.plan = LessonPlan(**data["plan"])
        if data.get("current_question"): 
            session.current_question = GeneratedQuestion(**data["current_question"])
        session.weak_concepts = data.get("weak_concepts", [])
        session.strong_concepts = data.get("strong_concepts", [])
        return session
