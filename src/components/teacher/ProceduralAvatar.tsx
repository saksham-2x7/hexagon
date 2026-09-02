"use client";
import { useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';
import * as THREE from 'three';

const ARIA_MODEL_URL = '/models/aria.glb';
const ALEX_MODEL_URL = '/models/alex.glb';

export default function ProceduralAvatar() {
  const { profile } = useAuthStore();
  const { teacherState } = useAIIntentStore();
  
  const isMale = profile?.tutorGender === 'male';
  const url = isMale ? ALEX_MODEL_URL : ARIA_MODEL_URL;
  const isSpeaking = teacherState === 'speaking' || teacherState === 'teaching' || teacherState === 'correcting' || teacherState === 'celebrating';

  const { scene, animations } = useGLTF(url);
  const headRef = useRef<THREE.Object3D | null>(null);

  // Auto-play any idle animations if they exist
  const { actions } = useAnimations(animations, scene);
  useEffect(() => {
    if (actions) {
      const actionKeys = Object.keys(actions);
      if (actionKeys.length > 0) {
        // Play the first animation (usually idle)
        actions[actionKeys[0]]?.play();
      }
    }
  }, [actions]);

  useEffect(() => {
    // Find the head bone for mouse tracking
    scene.traverse((child) => {
      // Common bone names for Head
      if (child.name.toLowerCase().includes('head') || child.name === 'mixamorigHead') {
        headRef.current = child;
      }
      
      // Fix material rendering (some GLBs are too dark without this)
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
           (mesh.material as THREE.Material).needsUpdate = true;
        }
      }
    });
  }, [scene, url]);

  useFrame((state, delta) => {
    if (headRef.current) {
      const targetX = (state.pointer.x * Math.PI) / 8;
      const targetY = (state.pointer.y * Math.PI) / 12;
      
      // Smooth look
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 2 * delta);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY, 2 * delta);
    }
    
    // Slight breathing float on the whole model if not animated
    if (scene) {
      scene.position.y = -1.6 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  return (
    <Suspense fallback={
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#00FF9D" wireframe />
      </mesh>
    }>
      <primitive 
        object={scene} 
        position={[0, -1.6, 0]} 
        scale={1.3}
      />
    </Suspense>
  );
}

useGLTF.preload(ARIA_MODEL_URL);
useGLTF.preload(ALEX_MODEL_URL);
