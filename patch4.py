import re

with open("src/app/(app)/tutor/page.tsx", "r") as f:
    content = f.read()

target = '        {/* RIGHT: Digital Whiteboard & Interactive Learning Console */}\n        <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">'
replacement = '        {/* RIGHT: Digital Whiteboard & Interactive Learning Console */}\n        <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto h-[calc(100vh-3.5rem)] min-h-0">'
content = content.replace(target, replacement)

with open("src/app/(app)/tutor/page.tsx", "w") as f:
    f.write(content)
