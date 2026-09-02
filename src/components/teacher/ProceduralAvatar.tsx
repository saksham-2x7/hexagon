"use client";
import { useRef, useEffect, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';
import * as THREE from 'three';

// We use the same premium blazer avatar for both, as requested by the user.
// (Because alex.glb is just a placeholder head, and they liked the blazer model).


interface ProceduralAvatarProps {
  lookAtBoard?: boolean;
  pointAtBoard?: boolean;
}

export default function ProceduralAvatar({ lookAtBoard = false, pointAtBoard = false }: ProceduralAvatarProps) {
  const { profile } = useAuthStore();
  const { teacherState } = useAIIntentStore();
  
  const isMale = profile?.tutorGender === 'male';
  const isSpeaking = teacherState === 'speaking' || teacherState === 'teaching' || teacherState === 'correcting' || teacherState === 'celebrating';

    // The user says "Aria is female, Alex is male".
  // The guy in the suit is in aria.glb (6MB). So that's the male (Alex).
  // The Avaturn model is in alex.glb (3.6MB). So that's the female (Aria).
  const modelUrl = isMale ? '/models/aria.glb' : '/models/alex.glb';
  const { scene, animations } = useGLTF(modelUrl);
  
  // Clone scene so multiple instances don't share bones or materials
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  const headRef = useRef<THREE.Object3D | null>(null);
  const rightArmRef = useRef<THREE.Object3D | null>(null);
  const rightForeArmRef = useRef<THREE.Object3D | null>(null);
  const spineRef = useRef<THREE.Object3D | null>(null);

  const { actions } = useAnimations(animations, clonedScene);
  useEffect(() => {
    if (actions) {
      const actionKeys = Object.keys(actions);
      if (actionKeys.length > 0) {
        const action = actions[actionKeys[0]];
        if (action) {
          action.play();
        }
      }
    }
  }, [actions]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      const name = child.name.toLowerCase();
      if (name.includes('head') || child.name === 'mixamorigHead') headRef.current = child;
      if (name.includes('rightarm') || child.name === 'mixamorigRightArm') rightArmRef.current = child;
      if (name.includes('rightforearm') || child.name === 'mixamorigRightForeArm') rightForeArmRef.current = child;
      if (name.includes('spine') || child.name === 'mixamorigSpine') spineRef.current = child;
      
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
           // Clone material so we can tint it independently
           mesh.material = (mesh.material as THREE.Material).clone();
           (mesh.material as THREE.Material).needsUpdate = true;
           
           if (mesh.material instanceof THREE.MeshStandardMaterial) {
              mesh.material.envMapIntensity = 1.2;
              
              // Tint the blazer to distinguish Aria (female) and Alex (male)
              // The blazer usually has "blazer", "jacket", "suit", or "cloth" in its name or material name.
              const matName = mesh.material.name.toLowerCase();
              if (matName.includes('outfit_top') || matName.includes('blazer')) {
                  if (!isMale) {
                     // Aria: Elegant rose/magenta tint for the blazer
                     mesh.material.color.setHex(0xb5179e); 
                  } else {
                     // Alex: Classic deep navy blue tint
                     mesh.material.color.setHex(0x0f2046);
                  }
              }
           }
        }
      }
    });
  }, [clonedScene, isMale]);

  useFrame((state, delta) => {
    // 1. Handle Head & Gaze
    if (headRef.current) {
      const targetX = lookAtBoard ? 0.6 : (state.pointer.x * Math.PI) / 8;
      const targetY = lookAtBoard ? 0.1 : (state.pointer.y * Math.PI) / 12;
      
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 3 * delta);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY, 3 * delta);
    }
    
    // 2. Handle Pointing Gesture
    if (rightArmRef.current && rightForeArmRef.current) {
      if (pointAtBoard) {
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -1.2, 4 * delta);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.2, 4 * delta);
        rightForeArmRef.current.rotation.z = THREE.MathUtils.lerp(rightForeArmRef.current.rotation.z, -0.2, 4 * delta);
      } else {
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.2, 4 * delta);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 4 * delta);
      }
    }
    
    // 3. Speaking / teaching micro-gestures (Subtle spine movement)
    if (spineRef.current && isSpeaking) {
       spineRef.current.rotation.x = THREE.MathUtils.lerp(spineRef.current.rotation.x, Math.sin(state.clock.elapsedTime * 4) * 0.02, 2 * delta);
       spineRef.current.rotation.z = THREE.MathUtils.lerp(spineRef.current.rotation.z, Math.cos(state.clock.elapsedTime * 2) * 0.01, 2 * delta);
    }

    if (clonedScene) {
      clonedScene.position.y = -1.6 + Math.sin(state.clock.elapsedTime * 2) * 0.01;
      clonedScene.position.x = 0;
      clonedScene.position.z = 0;
    }
  });

  return (
    <Suspense fallback={null}>
      <primitive 
        object={clonedScene} 
        position={[0, -1.6, 0]} 
        scale={1}
      />
    </Suspense>
  );
}

useGLTF.preload('/models/aria.glb');
useGLTF.preload('/models/alex.glb');

