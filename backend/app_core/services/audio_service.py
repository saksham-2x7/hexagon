import edge_tts
import re
from typing import AsyncGenerator

def _contains_devanagari(text: str) -> bool:
    """Check if the text contains Devanagari characters to determine the best voice."""
    return bool(re.search(r'[\u0900-\u097F]', text))

async def generate_tts_stream(text: str, gender: str = "female") -> AsyncGenerator[bytes, None]:
    """
    Asynchronously streams TTS audio bytes using edge-tts.
    Selects Indian voices based on gender and script (Hinglish/English vs Devanagari).
    """
    is_hindi_script = _contains_devanagari(text)
    
    if gender.lower() == "female":
        voice = "hi-IN-SwaraNeural" if is_hindi_script else "en-IN-NeerjaNeural"
    else:
        voice = "hi-IN-MadhurNeural" if is_hindi_script else "en-IN-PrabhatNeural"
        
    communicate = edge_tts.Communicate(text, voice)
    
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            yield chunk["data"]
