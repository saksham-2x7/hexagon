import re

with open("backend/app/services/teaching_engine.py", "r") as f:
    content = f.read()

# Replace session lookup with fallback
new_lookup = """    session = await session_repo.get_session(session_id)
    if not session:
        # FALLBACK FOR VERCEL EPHEMERAL DB
        from app.schemas.session import TeachingSession
        from contracts.pedagogy.models import LearnerProfile as EngineProfile, EducationalLevel, LearningStyle
        session = TeachingSession(
            session_id=session_id,
            learner_profile=EngineProfile(educational_level=EducationalLevel.BEGINNER, target_subject="Neural Networks", preferred_language="en", learning_style=LearningStyle.CONCEPTUAL),
            current_topic="Neural Networks",
            current_state=PedagogicalState.TEACHING
        )
"""
content = re.sub(r'    session = await session_repo\.get_session\(session_id\)\n    if not session:\n        yield json\.dumps\(\{"error": f"Session \{session_id\} not found"\}\)\n        return', new_lookup, content)

with open("backend/app/services/teaching_engine.py", "w") as f:
    f.write(content)
