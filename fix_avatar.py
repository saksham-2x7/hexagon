import re

with open('src/components/teacher/ProceduralAvatar.tsx', 'r') as f:
    code = f.read()

old_if = """              const matName = mesh.material.name.toLowerCase();
              if (name.includes('blazer') || name.includes('jacket') || name.includes('suit') || name.includes('cloth') || matName.includes('outfit_top')) {
                  if (!isMale) {
                     // Aria: Deep elegant magenta/pink tint
                     mesh.material.color.setHex(0x9d4edd); 
                  } else {
                     // Alex: Default or deep blue tint
                     mesh.material.color.setHex(0x1e3a8a);
                  }
              }"""

new_if = """              const matName = mesh.material.name.toLowerCase();
              if (matName.includes('outfit_top') || matName.includes('blazer')) {
                  if (!isMale) {
                     // Aria: Elegant rose/magenta tint for the blazer
                     mesh.material.color.setHex(0xb5179e); 
                  } else {
                     // Alex: Classic deep navy blue tint
                     mesh.material.color.setHex(0x0f2046);
                  }
              }"""

code = code.replace(old_if, new_if)

with open('src/components/teacher/ProceduralAvatar.tsx', 'w') as f:
    f.write(code)

