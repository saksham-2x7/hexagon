'use client';
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Icosahedron } from '@react-three/drei';
import { useInteractionStore } from '../../store/useInteractionStore';
import { useSemanticDispatcher } from '../../lib/api/useSemanticDispatcher';

export default function WebGLRepresentation() {
  const setCameraAngle = useInteractionStore((state) => state.setCameraAngle);
  const dispatchAction = useSemanticDispatcher((state) => state.dispatchAction);
  const [hovered, setHovered] = useState(false);

  return (
    <div className="w-full h-full bg-black">
      <Canvas onCreated={({ camera }) => setCameraAngle(camera.rotation.y)}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#4A90E2" />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#E24A90" />
        <Environment preset="city" />
        
        <Icosahedron 
          args={[2, 0]} 
          position={[0, 0, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => dispatchAction({ type: '3D_OBJECT_INTERACTED', target: 'icosahedron' })}
        >
          <meshPhysicalMaterial 
            color={hovered ? "#2a2a44" : "#1a1a24"} 
            emissive={hovered ? "#4A90E2" : "#000000"}
            emissiveIntensity={hovered ? 0.2 : 0}
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
