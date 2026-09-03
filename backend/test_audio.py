import asyncio
import os
import sys

# Ensure backend directory is in path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app_core.services.audio_service import generate_tts_stream

async def main():
    text = "Namaste! Aaj hum mitochondria aur cellular respiration ke baare mein baat karenge."
    print(f"Generating TTS for: {text}")
    
    stream = generate_tts_stream(text, gender="female")
    
    with open("test_hinglish_sample.mp3", "wb") as f:
        async for chunk in stream:
            f.write(chunk)
            
    print("Audio successfully saved to test_hinglish_sample.mp3")
            
if __name__ == "__main__":
    asyncio.run(main())
