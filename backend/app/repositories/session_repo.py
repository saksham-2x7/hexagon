from typing import Optional, Dict
from app.schemas.session import TeachingSession

class SessionRepository:
    def __init__(self):
        self._sessions: Dict[str, TeachingSession] = {}

    async def create_session(self, session: TeachingSession) -> TeachingSession:
        self._sessions[session.session_id] = session
        return session

    async def get_session(self, session_id: str) -> Optional[TeachingSession]:
        return self._sessions.get(session_id)

    async def update_session(self, session: TeachingSession) -> TeachingSession:
        self._sessions[session.session_id] = session
        return session

# Global instance for simplicity in this scaffolding
session_repo = SessionRepository()
