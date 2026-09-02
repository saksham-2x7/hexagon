import re

with open('src/components/teacher/ProceduralAvatar.tsx', 'r') as f:
    code = f.read()

old_use_memo = "const clonedScene = useMemo(() => scene.clone(), [scene, modelUrl]);"

new_use_memo = """const clonedScene = useMemo(() => {
    const s = scene.clone();
    
    // Bulletproof dynamic scaling: measure the exact height of the loaded model
    // and forcefully scale it to exactly 1.85 meters tall.
    const box = new THREE.Box3().setFromObject(s);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    if (size.y > 0) {
      const targetHeight = 1.85;
      const scaleFactor = targetHeight / size.y;
      s.scale.set(scaleFactor, scaleFactor, scaleFactor);
      // Offset so the lowest point (feet) rests at Y=0 relative to the scene
      s.position.y = -box.min.y * scaleFactor;
    }
    
    return s;
  }, [scene, modelUrl]);"""

code = code.replace(old_use_memo, new_use_memo)

# Remove the scale={isMale ? 1 : 0.01} from the group since s.scale handles it perfectly now
code = code.replace("<group position={[0, -1.4, 0]} scale={isMale ? 1 : 0.01}>", "<group position={[0, -1.4, 0]}>")

with open('src/components/teacher/ProceduralAvatar.tsx', 'w') as f:
    f.write(code)
