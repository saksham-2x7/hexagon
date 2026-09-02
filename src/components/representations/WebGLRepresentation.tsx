'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Icosahedron } from '@react-three/drei';
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

export default function WebGLRepresentation() {
  const setCameraAngle = useInteractionStore((state) => state.setCameraAngle);
  const dispatchAction = useSemanticDispatcher((state) => state.dispatchAction);

  return (
    <div className="w-full h-full bg-hexagon-dark">
      <Canvas onCreated={({ camera }) => setCameraAngle(camera.rotation.y)}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#4A90E2" />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#E24A90" />
        <Environment preset="city" />
        
        <Icosahedron 
          args={[2, 0]} 
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

        <ParallaxCamera />

        <EffectComposer>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={2.0} />
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
