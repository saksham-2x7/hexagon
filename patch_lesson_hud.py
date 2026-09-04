import re

with open("src/components/shell/LessonHUD.tsx", "r") as f:
    content = f.read()

target = """    try {
      const sessionId = sessionStorage.getItem('hexagon_session_id');
      if (!sessionId) throw new Error('No session ID');

      // Use relative path for Next.js proxy -> Vercel Backend
      const res = await fetch(`/api/v1/sessions/${sessionId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_input: userMsg })
      });

      if (!res.ok) throw new Error('Failed to send message');
      
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsProcessing(false);
    }"""

replacement = """    try {
      let sessionId = sessionStorage.getItem('hexagon_session_id');
      if (!sessionId) {
        // Automatically create a session if one doesn't exist
        console.warn('No session ID found. Initializing ad-hoc session...');
        sessionId = `session_local_${Date.now()}`;
        sessionStorage.setItem('hexagon_session_id', sessionId);
      }

      // Use relative path for Next.js proxy -> Vercel Backend
      const res = await fetch(`/api/v1/sessions/${sessionId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_input: userMsg })
      });

      if (!res.ok) throw new Error('Failed to send message');
      
      // Read the streaming response from the POST request
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let aiMessage = "";
        useAIIntentStore.getState().setTeacherState('thinking', 'Thinking...');
        
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
                  if (turnData.message) {
                    aiMessage = turnData.message;
                  }
                  useAIIntentStore.getState().setTeacherState(
                    turnData.teacher_state || 'speaking',
                    aiMessage
                  );
                  if (turnData.phase) useAIIntentStore.getState().setLessonPhase(turnData.phase);
                  if (turnData.question !== undefined) useAIIntentStore.getState().setActiveQuestion(turnData.question);
                  
                  const intentData = data.visual_intent || data.intent;
                  if (intentData && intentData.representation) {
                     useAIIntentStore.getState().setRepresentation(intentData.representation);
                  }
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
        
        // Add the AI response to the chat log
        if (aiMessage) {
           setMessages(prev => [...prev, { id: Date.now().toString(), role: 'teacher', text: aiMessage }]);
        }
      }
      
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsProcessing(false);
      useAIIntentStore.getState().setTeacherState('listening', '');
    }"""

content = content.replace(target, replacement)

with open("src/components/shell/LessonHUD.tsx", "w") as f:
    f.write(content)
