import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

async def run_trace():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        print("1. Creating Learner Profile & Session (Milestone 6)...")
        payload = {
            "learner_profile": {
                "educational_level": "BEGINNER",
                "learning_style": "CONCEPTUAL",
                "preferred_language": "English",
                "target_subject": "Ohm's Law",
                "available_time_minutes": 15
            },
            "current_topic": "Ohm's Law",
            "material_id": "doc_chapter4_electricity"
        }
        res = await client.post("/api/v1/sessions", json=payload)
            
        session_id = res.json()["session_id"]
        print(f" -> Session Created: {session_id}")

        print("\n2. Triggering Milestone 8 SSE Stream (Cross-Pair Integration)...")
        print(" -> Simulating student input: 'What is voltage?'")
        
        async with client.stream("POST", f"/api/v1/sessions/{session_id}/stream", json={"student_input": "What is voltage?"}) as response:
            async for line in response.aiter_lines():
                if line and line.startswith("data: "):
                    print(f" [SSE CHUNK]: {line[6:]}")

if __name__ == "__main__":
    asyncio.run(run_trace())
