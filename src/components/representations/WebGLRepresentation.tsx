'use client';
import { RepresentationProps } from '../../types/orchestration';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Icosahedron, ContactShadows, Float, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useInteractionStore } from '../../store/useInteractionStore';
import { useSemanticDispatcher } from '../../lib/api/useSemanticDispatcher';

function ParallaxCamera() {
  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 2, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.pointer.y * 2, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function WebGLRepresentation({ context }: RepresentationProps) {
  const setCameraAngle = useInteractionStore((state) => state.setCameraAngle);
  const dispatchAction = useSemanticDispatcher((state) => state.dispatchAction);

  return (
    <div className="w-full h-full bg-hexagon-dark">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }}
        onCreated={({ camera }) => setCameraAngle(camera.rotation.y)}
      >
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} color="#4A90E2" />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#E24A90" />
        <Environment preset="city" />
        
        <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
          <Icosahedron 
            args={[1.5, 0]} 
            position={[0, 0, 0]}
            onClick={() => dispatchAction({ type: '3D_OBJECT_INTERACTED', target: 'icosahedron' })}
          >
            <meshPhysicalMaterial 
              transmission={1} 
              roughness={0.05} 
              thickness={2.5} 
              ior={1.3} 
              {...{ chromaticAberration: 0.06 }} 
              clearcoat={1} 
              clearcoatRoughness={0.1} 
              color="#ffffff" 
            />
          </Icosahedron>
        </Float>

        <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={20} blur={2} far={4} color="#00FF9D" />
        <Sparkles count={150} scale={12} size={1.5} speed={0.3} opacity={0.4} color="#00FF9D" />

        <ParallaxCamera />

        <EffectComposer>
          <Bloom luminanceThreshold={1.2} mipmapBlur intensity={0.4} />
          <Vignette eskil={false} offset={0.1} darkness={1.2} />
        </EffectComposer>

        <OrbitControls 
          enableDamping 
          enableZoom={false}
          enablePan={false}
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
