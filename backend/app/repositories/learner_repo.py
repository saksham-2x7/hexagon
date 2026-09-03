from typing import List, Optional, Dict
from app.schemas.analytics import DiagnosticReport, LearnerProgressSummary, MasteryStatus
from app.core.database import DocumentStore
import uuid

class LearnerRepository:
    async def save_diagnostic_report(self, report: DiagnosticReport) -> DiagnosticReport:
        # Give the report a unique ID since it doesn't natively have one
        report_id = str(uuid.uuid4())
        await DocumentStore.put("diagnostics", report_id, report.model_dump(mode="json"))
        return report

    async def get_reports_by_student(self, student_id: str) -> List[DiagnosticReport]:
        all_reports_data = await DocumentStore.get_all("diagnostics")
        reports = []
        for data in all_reports_data:
            r = DiagnosticReport(**data)
            if r.student_id == student_id:
                reports.append(r)
        
        # Sort them by timestamp if needed, but append order is roughly preserved 
        # in the DB anyway. We will just return the filtered list.
        return reports

    async def get_report_by_session(self, session_id: str) -> Optional[DiagnosticReport]:
        all_reports_data = await DocumentStore.get_all("diagnostics")
        for data in all_reports_data:
            r = DiagnosticReport(**data)
            if r.session_id == session_id:
                return r
        return None

    async def get_learner_progress(self, student_id: str) -> Optional[LearnerProgressSummary]:
        reports = await self.get_reports_by_student(student_id)
        if not reports:
            return LearnerProgressSummary(
                student_id=student_id,
                completed_sessions_count=0,
                overall_average_score=0.0,
                masteries={},
                active_misconceptions=[],
                history=[]
            )

        completed_count = len(reports)
        avg_score = sum(r.total_score_percentage for r in reports) / completed_count
        
        masteries: Dict[str, MasteryStatus] = {}
        misconceptions = set()

        # Build masteries based on latest reports
        # To get the latest state of a concept, we iterate chronologically
        for r in reports:
            for concept in r.strong_areas:
                masteries[concept] = MasteryStatus.MASTERED
            for concept in r.needs_improvement:
                masteries[concept] = MasteryStatus.NEEDS_IMPROVEMENT
            
            for m in r.detected_misconceptions:
                misconceptions.add(m)

        return LearnerProgressSummary(
            student_id=student_id,
            completed_sessions_count=completed_count,
            overall_average_score=avg_score,
            masteries=masteries,
            active_misconceptions=list(misconceptions),
            history=reports
        )

learner_repo = LearnerRepository()
