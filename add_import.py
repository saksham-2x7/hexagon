import re

with open("src/components/shell/LessonHUD.tsx", "r") as f:
    content = f.read()

if "useAIIntentStore" not in content.split("export default")[0]:
    content = content.replace("import { Send, Mic, Play, Settings, Menu, X, ArrowLeft } from 'lucide-react';", "import { Send, Mic, Play, Settings, Menu, X, ArrowLeft } from 'lucide-react';\nimport { useAIIntentStore } from '../../store/useAIIntentStore';")

with open("src/components/shell/LessonHUD.tsx", "w") as f:
    f.write(content)
