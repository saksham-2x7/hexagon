import re

with open("src/components/shell/LessonHUD.tsx", "r") as f:
    content = f.read()

imports_to_add = """import { useAIIntentStore } from '../../store/useAIIntentStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAudioLipSync } from '../../hooks/useAudioLipSync';
"""

content = content.replace("import { useState, useRef, useEffect } from 'react';", "import { useState, useRef, useEffect } from 'react';\n" + imports_to_add)

with open("src/components/shell/LessonHUD.tsx", "w") as f:
    f.write(content)
