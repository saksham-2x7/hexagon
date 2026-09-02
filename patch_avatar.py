import re

with open('src/components/teacher/ProceduralAvatar.tsx', 'r') as f:
    code = f.read()

# Insert a useEffect to log bounding box
log_effect = """
  useEffect(() => {
    if (clonedScene) {
      const box = new THREE.Box3().setFromObject(clonedScene);
      console.log('Avatar Bounding Box:', box);
      console.log('Avatar Size:', box.getSize(new THREE.Vector3()));
    }
  }, [clonedScene]);
"""

code = code.replace("const { actions } = useAnimations(animations, clonedScene);", "const { actions } = useAnimations(animations, clonedScene);" + log_effect)

with open('src/components/teacher/ProceduralAvatar.tsx', 'w') as f:
    f.write(code)
