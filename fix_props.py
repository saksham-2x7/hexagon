import os

with open("src/app/(app)/tutor/page.tsx", "r") as f:
    content = f.read()

target = """            <ProceduralAvatar 
              gender={isMale ? 'male' : 'female'}
              isSpeaking={teacherState === 'speaking' || teacherState === 'teaching'}
            />"""

replacement = """            <ProceduralAvatar />"""

content = content.replace(target, replacement)

with open("src/app/(app)/tutor/page.tsx", "w") as f:
    f.write(content)
