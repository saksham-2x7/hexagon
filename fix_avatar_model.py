import re

with open('src/components/teacher/ProceduralAvatar.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    "const MODEL_URL = '/models/aria.glb';",
    ""
)

# We need to dynamically load the model.
# In React Three Fiber, if we dynamically change the URL passed to useGLTF, we must preload both.

preload_statements = """useGLTF.preload('/models/aria.glb');
useGLTF.preload('/models/alex.glb');
"""

code = code.replace("useGLTF.preload(MODEL_URL);", preload_statements)

# Inside the component:
use_gltf_line = "const { scene, animations } = useGLTF(MODEL_URL);"
new_use_gltf = """  // The user says "Aria is female, Alex is male".
  // The guy in the suit is in aria.glb (6MB). So that's the male (Alex).
  // The Avaturn model is in alex.glb (3.6MB). So that's the female (Aria).
  const modelUrl = isMale ? '/models/aria.glb' : '/models/alex.glb';
  const { scene, animations } = useGLTF(modelUrl);"""

code = code.replace(use_gltf_line, new_use_gltf)

with open('src/components/teacher/ProceduralAvatar.tsx', 'w') as f:
    f.write(code)

