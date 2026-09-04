import re

with open("backend/app/api/v1/endpoints/sessions.py", "r") as f:
    content = f.read()

# Replace session lookup in interact
new_lookup = """    session = await session_repo.get_session(session_id)
    if not session:
        # Fallback for Vercel Ephemeral DB
        pass
    else:
        turn = InteractionTurn(
            turn_id=str(uuid.uuid4()),
            state=session.current_state,
            student_input=request.student_input
        )
        session.history.append(turn)
        session.updated_at = datetime.now(timezone.utc)
        await session_repo.update_session(session)
"""
content = re.sub(r'    session = await session_repo\.get_session\(session_id\)\n    if not session:\n        raise HTTPException\(status_code=status\.HTTP_404_NOT_FOUND, detail="Session not found"\)\n    \n    turn = InteractionTurn\(\n        turn_id=str\(uuid\.uuid4\(\)\),\n        state=session\.current_state,\n        student_input=request\.student_input\n    \)\n    session\.history\.append\(turn\)\n    session\.updated_at = datetime\.now\(timezone\.utc\)\n    await session_repo\.update_session\(session\)', new_lookup, content)

with open("backend/app/api/v1/endpoints/sessions.py", "w") as f:
    f.write(content)
