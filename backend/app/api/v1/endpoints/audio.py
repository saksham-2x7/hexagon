from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app_core.services.audio_service import generate_tts_stream

router = APIRouter()

@router.get("/tts")
async def text_to_speech(text: str, gender: str = "female"):
    stream = generate_tts_stream(text, gender)
    return StreamingResponse(stream, media_type="audio/mpeg")
