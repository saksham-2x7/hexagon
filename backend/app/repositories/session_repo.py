from typing import Optional, Dict
from app.schemas.session import TeachingSession
from app.core.database import DocumentStore

class SessionRepository:
    async def create_session(self, session: TeachingSession) -> TeachingSession:
        await DocumentStore.put("sessions", session.session_id, session.model_dump(mode="json"))
        return session

    async def get_session(self, session_id: str) -> Optional[TeachingSession]:
        data = await DocumentStore.get("sessions", session_id)
        if data:
            return TeachingSession(**data)
        return None

    async def update_session(self, session: TeachingSession) -> TeachingSession:
        await DocumentStore.put("sessions", session.session_id, session.model_dump(mode="json"))
        return session

# Global instance for simplicity in this scaffolding
session_repo = SessionRepository()
