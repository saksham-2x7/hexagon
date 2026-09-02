"use client";
import { useRef, useEffect, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';
import * as THREE from 'three';

interface ProceduralAvatarProps {
  lookAtBoard?: boolean;
  pointAtBoard?: boolean; // We keep the prop for API compatibility but disable manual arm IK
}

export default function ProceduralAvatar({ lookAtBoard = false }: ProceduralAvatarProps) {
  const { profile } = useAuthStore();
  const { teacherState } = useAIIntentStore();
  
  const isMale = profile?.tutorGender === 'male';
  const isSpeaking = teacherState === 'speaking' || teacherState === 'teaching' || teacherState === 'correcting' || teacherState === 'celebrating';

  // Use the actual female model for Aria, and the suit model for Alex.
  const modelUrl = isMale ? '/models/aria.glb' : '/models/female.glb';
  const { scene, animations } = useGLTF(modelUrl);
  
  // Clone scene so multiple instances don't share bones or materials
  const clonedScene = useMemo(() => scene.clone(), [scene, modelUrl]);
  
  const headRef = useRef<THREE.Object3D | null>(null);
  const spineRef = useRef<THREE.Object3D | null>(null);

  const { actions } = useAnimations(animations, clonedScene);
  
  useEffect(() => {
    if (actions) {
      // Find "idle" animation first, fallback to the first available one
      let idleAction = actions['idle'] || actions['standing'] || actions['idle_01'];
      if (!idleAction && Object.keys(actions).length > 0) {
        idleAction = actions[Object.keys(actions)[0]];
      }
      
      if (idleAction) {
        idleAction.reset().fadeIn(0.5).play();
      }
      
      return () => {
        if (idleAction) idleAction.fadeOut(0.5);
      };
    }
  }, [actions, modelUrl]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      const name = child.name.toLowerCase();
      if (name.includes('head') || child.name === 'mixamorigHead') headRef.current = child;
      if (name.includes('spine') || child.name === 'mixamorigSpine') spineRef.current = child;
      
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
           mesh.material = (mesh.material as THREE.Material).clone();
           (mesh.material as THREE.Material).needsUpdate = true;
           
           if (mesh.material instanceof THREE.MeshStandardMaterial) {
              mesh.material.envMapIntensity = 1.2;
              
              // No tinting needed anymore since we have a real female model!
           }
        }
      }
    });
  }, [clonedScene]);

  useFrame((state, delta) => {
    // 1. Handle Head & Gaze
    if (headRef.current) {
      const targetX = lookAtBoard ? 0.6 : (state.pointer.x * Math.PI) / 8;
      const targetY = lookAtBoard ? 0.1 : (state.pointer.y * Math.PI) / 12;
      
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 3 * delta);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY, 3 * delta);
    }
    
    // 2. Speaking / teaching micro-gestures (Subtle spine movement to supplement idle anim)
    if (spineRef.current && isSpeaking) {
       spineRef.current.rotation.x = THREE.MathUtils.lerp(spineRef.current.rotation.x, Math.sin(state.clock.elapsedTime * 4) * 0.02, 2 * delta);
       spineRef.current.rotation.z = THREE.MathUtils.lerp(spineRef.current.rotation.z, Math.cos(state.clock.elapsedTime * 2) * 0.01, 2 * delta);
    }

    if (clonedScene) {
      
      
      
    }
  });

  return (
    <Suspense fallback={null}>
      <group position={[0, -1.4, 0]} scale={isMale ? 1 : 0.01}>
        <primitive object={clonedScene} />
      </group>
    </Suspense>
  );
}

useGLTF.preload('/models/aria.glb');
useGLTF.preload('/models/female.glb');
