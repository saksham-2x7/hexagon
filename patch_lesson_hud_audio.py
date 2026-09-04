import re

with open("src/components/shell/LessonHUD.tsx", "r") as f:
    content = f.read()

# Make sure useAudioLipSync and useAuthStore are imported
if "useAudioLipSync" not in content:
    content = content.replace("import { useAIIntentStore } from '../../store/useAIIntentStore';", "import { useAIIntentStore } from '../../store/useAIIntentStore';\nimport { useAudioLipSync } from '../../hooks/useAudioLipSync';\nimport { useAuthStore } from '../../store/useAuthStore';")

# Inside LessonHUD component, add the hooks
hook_injection = """  const { profile } = useAuthStore();
  const tutorGender = profile?.tutorGender || 'female';
  const { connectAudioElement } = useAudioLipSync();
"""
if "tutorGender" not in content:
    content = content.replace("const [isProcessing, setIsProcessing] = useState(false);", "const [isProcessing, setIsProcessing] = useState(false);\n" + hook_injection)

# Add TTS playback in the chunk parsing
target_loop = """                  if (turnData.message) {
                    aiMessage = turnData.message;
                  }"""
                  
replacement_loop = """                  if (turnData.message) {
                    aiMessage = turnData.message;
                  }
                  if (turnData.audio_url || turnData.audio_base64) {
                    const src = turnData.audio_url || `data:audio/mp3;base64,${turnData.audio_base64}`;
                    const audioEl = new Audio(src);
                    audioEl.crossOrigin = 'anonymous';
                    connectAudioElement(audioEl);
                    audioEl.play().catch(e => console.warn(e));
                  } else if (turnData.message && !turnData.audio_url && !turnData.audio_base64 && line.includes('"phase"')) {
                    // Fallback to live TTS if no audio payload
                    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
                    const audioUrl = `${BACKEND_URL}/api/v1/tts?text=${encodeURIComponent(turnData.message)}&gender=${tutorGender}`;
                    const audioEl = new Audio(audioUrl);
                    audioEl.crossOrigin = 'anonymous';
                    connectAudioElement(audioEl);
                    audioEl.play().catch(e => console.warn(e));
                  }"""
content = content.replace(target_loop, replacement_loop)

with open("src/components/shell/LessonHUD.tsx", "w") as f:
    f.write(content)
