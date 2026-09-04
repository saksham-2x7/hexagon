import re

# Fix TutorPage
with open("src/app/(app)/tutor/page.tsx", "r") as f:
    tutor_content = f.read()

# Add connectAudioElement to hook destruction
tutor_content = tutor_content.replace("const { stopAudio, getAudioContext } = useAudioLipSync();", "const { stopAudio, getAudioContext, connectAudioElement } = useAudioLipSync();")
# Replace getState()
tutor_content = tutor_content.replace("useAudioLipSync.getState().connectAudioElement(audioEl);", "connectAudioElement(audioEl);")

with open("src/app/(app)/tutor/page.tsx", "w") as f:
    f.write(tutor_content)

# Fix LessonHUD
with open("src/components/shell/LessonHUD.tsx", "r") as f:
    hud_content = f.read()

# Already injected auth store but imports are missing
if "import { useAuthStore }" not in hud_content:
    hud_content = hud_content.replace("import { useAIIntentStore } from '../../store/useAIIntentStore';", "import { useAIIntentStore } from '../../store/useAIIntentStore';\nimport { useAuthStore } from '../../store/useAuthStore';\nimport { useAudioLipSync } from '../../hooks/useAudioLipSync';")

with open("src/components/shell/LessonHUD.tsx", "w") as f:
    f.write(hud_content)

