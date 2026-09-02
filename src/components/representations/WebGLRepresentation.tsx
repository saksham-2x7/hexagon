'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Icosahedron } from '@react-three/drei';
import { useInteractionStore } from '../../store/useInteractionStore';

export default function WebGLRepresentation() {
  const setCameraAngle = useInteractionStore((state) => state.setCameraAngle);

  return (
    <div className="w-full h-full bg-black">
      <Canvas onCreated={({ camera }) => setCameraAngle(camera.rotation.y)}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#4A90E2" />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#E24A90" />
        <Environment preset="city" />
        
        <Icosahedron args={[2, 0]} position={[0, 0, 0]}>
          <meshPhysicalMaterial 
            color="#1a1a24" 
            metalness={0.9} 
            roughness={0.1} 
            clearcoat={1} 
            clearcoatRoughness={0.1}
            wireframe={true}
          />
        </Icosahedron>

        <OrbitControls 
          enableDamping 
          autoRotate 
          autoRotateSpeed={0.5}
          onChange={(e) => {
            if (e?.target?.object) {
              setCameraAngle(e.target.object.rotation.y);
            }
          }}
        />
      </Canvas>
    </div>
  );
}
