from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from uuid import UUID

from app.schemas.analytics import (
    AssessmentSubmission,
    DiagnosticReport,
    LearnerProgressSummary,
)
from contracts.pedagogy.state_machine import TeachingState
from app.repositories.session_repo import session_repo
from app.repositories.learner_repo import learner_repo

router = APIRouter()

@router.post("/sessions/{session_id}/assessment", response_model=DiagnosticReport, status_code=status.HTTP_201_CREATED)
async def submit_assessment(session_id: str, submission: AssessmentSubmission):
    session = await session_repo.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    
    items = submission.items
    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assessment must contain at least one item")

    # Compute scores and concept accuracies
    correct_count = sum(1 for item in items if item.is_correct)
    total_score_percentage = (correct_count / len(items)) * 100.0

    concept_stats = {}
    misconceptions = set()

    for item in items:
        if item.concept_tested not in concept_stats:
            concept_stats[item.concept_tested] = {"correct": 0, "total": 0}
        concept_stats[item.concept_tested]["total"] += 1
        if item.is_correct:
            concept_stats[item.concept_tested]["correct"] += 1
        
        if item.misconception_identified:
            misconceptions.add(item.misconception_identified)

    strong_areas = []
    needs_improvement = []

    for concept, stats in concept_stats.items():
        accuracy = stats["correct"] / stats["total"]
        if accuracy >= 0.8:
            strong_areas.append(concept)
        else:
            needs_improvement.append(concept)

    # Generate Report
    report = DiagnosticReport(
        session_id=session.session_id,
        student_id=session.learner_profile.student_id,
        topic=session.current_topic,
        total_score_percentage=total_score_percentage,
        strong_areas=strong_areas,
        needs_improvement=needs_improvement,
        detected_misconceptions=list(misconceptions),
        recommended_revision=needs_improvement.copy(), # Basic logic: revise weak areas
        suggested_next_topics=[] # Placeholder for future generative logic
    )

    # Persist Report
    await learner_repo.save_diagnostic_report(report)

    # Update session state to COMPLETED
    session.current_state = TeachingState.COMPLETED
    session.updated_at = datetime.now(timezone.utc)
    await session_repo.update_session(session)

    return report

@router.get("/learners/{student_id}/progress", response_model=LearnerProgressSummary)
async def get_learner_progress(student_id: str):
    # Basic validation of UUID format to match requirement: "or 404 only if invalid UUID format"
    try:
        UUID(student_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid student_id format")

    progress = await learner_repo.get_learner_progress(student_id)
    return progress

@router.get("/sessions/{session_id}/report", response_model=DiagnosticReport)
async def get_session_report(session_id: str):
    report = await learner_repo.get_report_by_session(session_id)
    if report:
        return report
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found for this session")
