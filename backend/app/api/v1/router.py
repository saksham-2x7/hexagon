from fastapi import APIRouter

from app.api.v1.endpoints import health, sessions, analytics, materials, avatar, tts

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(analytics.router, tags=["analytics"])
api_router.include_router(materials.router, prefix="/materials", tags=["materials"])
api_router.include_router(avatar.router, prefix="/avatar", tags=["avatar"])
api_router.include_router(tts.router, prefix="/tts", tags=["tts"])
