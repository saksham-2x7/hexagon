"use client";
import { useRef, useEffect, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';
import * as THREE from 'three';

const ARIA_MODEL_URL = '/models/aria.glb';
const ALEX_MODEL_URL = '/models/alex.glb';

interface ProceduralAvatarProps {
  lookAtBoard?: boolean;
  pointAtBoard?: boolean;
}

export default function ProceduralAvatar({ lookAtBoard = false, pointAtBoard = false }: ProceduralAvatarProps) {
  const { profile } = useAuthStore();
  const { teacherState } = useAIIntentStore();
  
  const isMale = profile?.tutorGender === 'male';
  const url = isMale ? ALEX_MODEL_URL : ARIA_MODEL_URL;
  const isSpeaking = teacherState === 'speaking' || teacherState === 'teaching' || teacherState === 'correcting' || teacherState === 'celebrating';

  const { scene, animations } = useGLTF(url);
  
  // Clone scene so multiple instances don't share bones
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  const headRef = useRef<THREE.Object3D | null>(null);
  const rightArmRef = useRef<THREE.Object3D | null>(null);
  const rightForeArmRef = useRef<THREE.Object3D | null>(null);
  const spineRef = useRef<THREE.Object3D | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { actions } = useAnimations(animations, clonedScene);
  useEffect(() => {
    if (actions) {
      const actionKeys = Object.keys(actions);
      if (actionKeys.length > 0) {
        // Disable root motion / walking by finding Idle or using the first one but freezing position
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
           (mesh.material as THREE.Material).needsUpdate = true;
           // Ensure it's not totally black in some lights
           if (mesh.material instanceof THREE.MeshStandardMaterial) {
              mesh.material.envMapIntensity = 1.2;
           }
        }
      }
    });
  }, [clonedScene, url]);

  useFrame((state, delta) => {
    // 1. Handle Head & Gaze
    if (headRef.current) {
      // If looking at board (which is on the right of the screen), turn head right
      const targetX = lookAtBoard ? 0.6 : (state.pointer.x * Math.PI) / 8;
      const targetY = lookAtBoard ? 0.1 : (state.pointer.y * Math.PI) / 12;
      
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 3 * delta);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY, 3 * delta);
    }
    
    // 2. Handle Pointing Gesture
    if (rightArmRef.current && rightForeArmRef.current) {
      if (pointAtBoard) {
        // Lift arm to point right
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -1.2, 4 * delta);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.2, 4 * delta);
        rightForeArmRef.current.rotation.z = THREE.MathUtils.lerp(rightForeArmRef.current.rotation.z, -0.2, 4 * delta);
      } else {
        // Relax arm
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.2, 4 * delta);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 4 * delta);
      }
    }
    
    // 3. Speaking / teaching micro-gestures (Subtle spine movement)
    if (spineRef.current && isSpeaking) {
       spineRef.current.rotation.x = THREE.MathUtils.lerp(spineRef.current.rotation.x, Math.sin(state.clock.elapsedTime * 4) * 0.02, 2 * delta);
       spineRef.current.rotation.z = THREE.MathUtils.lerp(spineRef.current.rotation.z, Math.cos(state.clock.elapsedTime * 2) * 0.01, 2 * delta);
    }

    if (groupRef.current) {
      // Ground the model firmly, only breathe subtly
      groupRef.current.position.y = -1.6 + Math.sin(state.clock.elapsedTime * 2) * 0.01;
      groupRef.current.position.x = 0;
      groupRef.current.position.z = 0;
    }
  });

  return (
    <Suspense fallback={null}>
      <group ref={groupRef}>
      <primitive 
        object={clonedScene} 
        position={[0, -1.6, 0]} 
        scale={1.3}
      />
    </group>
    </Suspense>
  );
}

useGLTF.preload(ARIA_MODEL_URL);
useGLTF.preload(ALEX_MODEL_URL);
