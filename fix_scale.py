import re

with open('src/components/teacher/ProceduralAvatar.tsx', 'r') as f:
    code = f.read()

# Instead of relying on <primitive scale={...}>, we force the scale on the clonedScene
# directly in the useMemo or useEffect.
old_use_memo = "const clonedScene = useMemo(() => scene.clone(), [scene, modelUrl]);"
new_use_memo = """const clonedScene = useMemo(() => {
    const s = scene.clone();
    // Force scale explicitly
    if (!isMale) {
      s.scale.set(0.01, 0.01, 0.01);
    } else {
      s.scale.set(1, 1, 1);
    }
    return s;
  }, [scene, modelUrl, isMale]);"""

code = code.replace(old_use_memo, new_use_memo)

with open('src/components/teacher/ProceduralAvatar.tsx', 'w') as f:
    f.write(code)
