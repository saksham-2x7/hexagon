import re

with open("src/app/(app)/tutor/page.tsx", "r") as f:
    content = f.read()

target = """    if (sessionId) {
      try {
        await fetch(`/api/v1/sessions/${sessionId}/interact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_input: userText })
        });
      } catch (e) {
        console.error('Failed to send interaction to backend:', e);
      }
    }"""

replacement = """    if (!sessionId) {
      console.warn("No session ID. Initializing local session...");
      sessionStorage.setItem('hexagon_session_id', `session_local_${Date.now()}`);
    }
    
    const activeSessionId = sessionStorage.getItem('hexagon_session_id');

    if (activeSessionId) {
      try {
        const res = await fetch(`/api/v1/sessions/${activeSessionId}/interact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_input: userText })
        });
        
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
          useAIIntentStore.getState().setTeacherState('thinking', 'Thinking...');
          let aiMessage = "";
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  const turnData = data.teaching_turn || data.turn || (data.message ? data : null);
                  if (turnData) {
                    if (turnData.message) aiMessage = turnData.message;
                    
                    useAIIntentStore.getState().setTeacherState(
                      turnData.teacher_state || 'speaking',
                      aiMessage
                    );
                    
                    if (turnData.audio_url || turnData.audio_base64) {
                      const src = turnData.audio_url || `data:audio/mp3;base64,${turnData.audio_base64}`;
                      const audioEl = new Audio(src);
                      audioEl.crossOrigin = 'anonymous';
                      useAudioLipSync.getState().connectAudioElement(audioEl);
                      audioEl.play().catch(e => console.warn(e));
                    }
                  }
                } catch (e) {}
              }
            }
          }
          useAIIntentStore.getState().setTeacherState('listening', '');
        }

      } catch (e) {
        console.error('Failed to send interaction to backend:', e);
        useAIIntentStore.getState().setTeacherState('listening', '');
      }
    }"""

content = content.replace(target, replacement)
with open("src/app/(app)/tutor/page.tsx", "w") as f:
    f.write(content)
