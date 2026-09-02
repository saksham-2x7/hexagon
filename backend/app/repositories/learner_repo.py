from typing import List, Optional, Dict
from app.schemas.analytics import DiagnosticReport, LearnerProgressSummary, MasteryStatus

class LearnerRepository:
    def __init__(self):
        # Maps student_id to list of DiagnosticReports
        self._reports: Dict[str, List[DiagnosticReport]] = {}

    async def save_diagnostic_report(self, report: DiagnosticReport) -> DiagnosticReport:
        if report.student_id not in self._reports:
            self._reports[report.student_id] = []
        self._reports[report.student_id].append(report)
        return report

    async def get_reports_by_student(self, student_id: str) -> List[DiagnosticReport]:
        return self._reports.get(student_id, [])

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
