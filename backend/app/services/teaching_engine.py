import asyncio
import json
from typing import AsyncGenerator, Optional
import uuid
from app.schemas.interaction import PedagogicalState

async def mock_generate_teaching_turn(session_id: str, student_input: Optional[str] = None) -> AsyncGenerator[str, None]:
    """
    STUB: This is the interface Saksham (Pair 1) will replace with actual Gemini LLM logic.
    Yields JSON string chunks formatted for SSE.
    """
    turn_id = str(uuid.uuid4())
    
    # Chunk 1: The state transitions and first words
    chunk_1 = {
        "turn_id": turn_id,
        "state": PedagogicalState.TEACHING.value,
        "spoken_text": "Hello! Based on what you just said, "
    }
    yield json.dumps(chunk_1)
    await asyncio.sleep(0.5)
    
    # Chunk 2: More words
    chunk_2 = {
        "turn_id": turn_id,
        "state": PedagogicalState.TEACHING.value,
        "spoken_text": "we are going to look at a new concept."
    }
    yield json.dumps(chunk_2)
    await asyncio.sleep(0.5)
    
    # Chunk 3: Final words and a visual intent payload
    chunk_3 = {
        "turn_id": turn_id,
        "state": PedagogicalState.TEACHING.value,
        "spoken_text": " Let's draw a diagram on the board.",
        "visual_intent": {
            "type": "diagram",
            "content": "A basic mind map."
        }
    }
    yield json.dumps(chunk_3)
