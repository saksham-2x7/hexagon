import re

with open('src/components/teacher/ProceduralAvatar.tsx', 'r') as f:
    code = f.read()

# 1. Remove useMemo manual scaling, just return scene.clone()
old_use_memo = """  const clonedScene = useMemo(() => {
    const s = scene.clone();
    // Force scale explicitly
    if (!isMale) {
      s.scale.set(0.01, 0.01, 0.01);
    } else {
      s.scale.set(1, 1, 1);
    }
    return s;
  }, [scene, modelUrl, isMale]);"""
new_use_memo = "  const clonedScene = useMemo(() => scene.clone(), [scene, modelUrl]);"
code = code.replace(old_use_memo, new_use_memo)

# 2. Remove clonedScene.position.y = -1.4 from useFrame
code = code.replace(
    "clonedScene.position.y = -1.4; // Keep feet planted on the ground",
    ""
)
code = code.replace(
    "clonedScene.position.x = 0;",
    ""
)
code = code.replace(
    "clonedScene.position.z = 0;",
    ""
)

# 3. Use group for scaling and positioning
old_return = """  return (
    <Suspense fallback={null}>
      <primitive 
        object={clonedScene} 
        position={[0, -1.4, 0]} 
        scale={1}
      />
    </Suspense>
  );"""
new_return = """  return (
    <Suspense fallback={null}>
      <group position={[0, -1.4, 0]} scale={isMale ? 1 : 0.01}>
        <primitive object={clonedScene} />
      </group>
    </Suspense>
  );"""
code = code.replace(old_return, new_return)

with open('src/components/teacher/ProceduralAvatar.tsx', 'w') as f:
    f.write(code)
