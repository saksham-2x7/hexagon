"use client";
import { useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';
import * as THREE from 'three';

const ARIA_MODEL_URL = 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb';
const ALEX_MODEL_URL = 'https://models.readyplayer.me/63b827e8a946d97e7f6f1400.glb';

useGLTF.preload(ARIA_MODEL_URL);
useGLTF.preload(ALEX_MODEL_URL);

export default function ProceduralAvatar() {
  const { profile } = useAuthStore();
  const { teacherState } = useAIIntentStore();
  
  const isMale = profile?.tutorGender === 'male';
  const url = isMale ? ALEX_MODEL_URL : ARIA_MODEL_URL;
  const isSpeaking = teacherState === 'speaking' || teacherState === 'teaching' || teacherState === 'correcting' || teacherState === 'celebrating';

  const { scene } = useGLTF(url);
  const headRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.name === 'Head' || child.name === 'mixamorigHead') {
        headRef.current = child;
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (headRef.current) {
      const targetX = (state.pointer.x * Math.PI) / 8;
      const targetY = (state.pointer.y * Math.PI) / 12;
      
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 2 * delta);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY, 2 * delta);
    }
  });

  return (
    <Suspense fallback={
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#333" wireframe />
      </mesh>
    }>
      <primitive 
        object={scene} 
        position={[0, -1.6, 0]} 
        scale={1.2}
      />
    </Suspense>
  );
}
