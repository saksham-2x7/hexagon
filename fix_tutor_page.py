import re

with open('src/app/(app)/tutor/page.tsx', 'r') as f:
    code = f.read()

# Fix ContactShadows and OrbitControls
code = code.replace(
    "<ContactShadows position={[0, -1.6, 0]} opacity={0.7} scale={10} blur={2} far={4} />",
    "<ContactShadows position={[0, -1.4, 0]} opacity={0.7} scale={10} blur={2} far={4} />"
)

# We want OrbitControls to target the upper body, e.g., y=-0.5
code = code.replace(
    "<OrbitControls enableZoom={true} minDistance={1.5} maxDistance={5} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2} />",
    "<OrbitControls enableZoom={true} minDistance={1.5} maxDistance={5} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2} target={[0, -0.5, 0]} />"
)

with open('src/app/(app)/tutor/page.tsx', 'w') as f:
    f.write(code)
