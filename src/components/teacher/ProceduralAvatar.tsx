"use client";
import { useRef, useEffect, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

interface ProceduralAvatarProps {
  lookAtBoard?: boolean;
  pointAtBoard?: boolean;
}

export default function ProceduralAvatar({ lookAtBoard = false, pointAtBoard = false }: ProceduralAvatarProps) {
  const { profile } = useAuthStore();
  const { teacherState } = useAIIntentStore();
  
  const isMale = profile?.tutorGender === 'male';
  const isSpeaking = teacherState === 'speaking' || teacherState === 'teaching' || teacherState === 'correcting' || teacherState === 'celebrating';

  // Refs for animation
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const rightForeArmRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);

  // Materials
  const accentColor = isMale ? "#3b82f6" : "#00FF9D"; // Blue for Alex, Green for Aria
  const bodyColor = "#1a1a1a";
  
  // Premium materials
  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: bodyColor,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 2.0,
  }), [bodyColor]);

  const glowMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 2.0,
    toneMapped: false
  }), [accentColor]);

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
        // Lift arm to point right
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -1.2, 4 * delta);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.2, 4 * delta);
        rightForeArmRef.current.rotation.z = THREE.MathUtils.lerp(rightForeArmRef.current.rotation.z, -0.2, 4 * delta);
      } else {
        // Relax arm
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.2, 4 * delta);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 4 * delta);
        rightForeArmRef.current.rotation.z = THREE.MathUtils.lerp(rightForeArmRef.current.rotation.z, 0, 4 * delta);
      }
    }
    
    // 3. Speaking / teaching micro-gestures
    if (spineRef.current) {
       const speakingSpineMotion = isSpeaking ? Math.sin(state.clock.elapsedTime * 4) * 0.05 : 0;
       spineRef.current.rotation.x = THREE.MathUtils.lerp(spineRef.current.rotation.x, speakingSpineMotion, 2 * delta);
    }

    if (groupRef.current) {
      // Ground the model firmly, only breathe subtly
      groupRef.current.position.y = -1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  return (
    <Suspense fallback={null}>
      <group ref={groupRef} position={[0, -1.0, 0]} scale={isMale ? 1.05 : 0.95}>
        
        {/* SPINE / TORSO */}
        <group ref={spineRef} position={[0, 1.2, 0]}>
          <RoundedBox args={[0.6, 0.8, 0.4]} radius={0.1} smoothness={4} material={glassMaterial} />
          
          {/* Glowing Core (Heart/Processor) */}
          <mesh position={[0, 0.1, 0.2]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>

          {/* HEAD */}
          <group ref={headRef} position={[0, 0.6, 0]}>
            <RoundedBox args={[0.35, 0.45, 0.35]} radius={0.15} smoothness={4} material={glassMaterial} position={[0, 0.15, 0]} />
            {/* Eyes */}
            <mesh position={[-0.08, 0.2, 0.17]}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <primitive object={glowMaterial} attach="material" />
            </mesh>
            <mesh position={[0.08, 0.2, 0.17]}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <primitive object={glowMaterial} attach="material" />
            </mesh>
            {/* Holographic face visor line */}
            <mesh position={[0, 0.1, 0.175]}>
              <boxGeometry args={[0.2, 0.02, 0.02]} />
              <primitive object={glowMaterial} attach="material" />
            </mesh>
          </group>

          {/* LEFT ARM */}
          <group position={[-0.4, 0.3, 0]}>
            {/* Shoulder */}
            <mesh material={glassMaterial}><sphereGeometry args={[0.12, 32, 32]} /></mesh>
            {/* Upper Arm */}
            <RoundedBox args={[0.15, 0.5, 0.15]} position={[0, -0.25, 0]} radius={0.05} material={glassMaterial} />
            {/* Forearm */}
            <group position={[0, -0.5, 0]}>
               <mesh material={glassMaterial}><sphereGeometry args={[0.1, 32, 32]} /></mesh>
               <RoundedBox args={[0.12, 0.4, 0.12]} position={[0, -0.2, 0]} radius={0.05} material={glassMaterial} />
            </group>
          </group>

          {/* RIGHT ARM (Animated for pointing) */}
          <group position={[0.4, 0.3, 0]} ref={rightArmRef}>
            {/* Shoulder */}
            <mesh material={glassMaterial}><sphereGeometry args={[0.12, 32, 32]} /></mesh>
            {/* Upper Arm */}
            <RoundedBox args={[0.15, 0.5, 0.15]} position={[0, -0.25, 0]} radius={0.05} material={glassMaterial} />
            {/* Forearm (Animated) */}
            <group position={[0, -0.5, 0]} ref={rightForeArmRef}>
               <mesh material={glassMaterial}><sphereGeometry args={[0.1, 32, 32]} /></mesh>
               <RoundedBox args={[0.12, 0.4, 0.12]} position={[0, -0.2, 0]} radius={0.05} material={glassMaterial} />
               {/* Glowing Hand/Emitter */}
               <mesh position={[0, -0.45, 0]}>
                 <sphereGeometry args={[0.08, 16, 16]} />
                 <primitive object={glowMaterial} attach="material" />
               </mesh>
            </group>
          </group>

        </group>

        {/* HIPS & LEGS */}
        <group position={[0, 0.7, 0]}>
          <RoundedBox args={[0.5, 0.3, 0.35]} radius={0.1} material={glassMaterial} />
          
          {/* Left Leg */}
          <group position={[-0.15, -0.15, 0]}>
             <RoundedBox args={[0.18, 0.6, 0.18]} position={[0, -0.3, 0]} radius={0.05} material={glassMaterial} />
             <RoundedBox args={[0.15, 0.5, 0.15]} position={[0, -0.9, 0]} radius={0.05} material={glassMaterial} />
          </group>
          
          {/* Right Leg */}
          <group position={[0.15, -0.15, 0]}>
             <RoundedBox args={[0.18, 0.6, 0.18]} position={[0, -0.3, 0]} radius={0.05} material={glassMaterial} />
             <RoundedBox args={[0.15, 0.5, 0.15]} position={[0, -0.9, 0]} radius={0.05} material={glassMaterial} />
          </group>
        </group>

      </group>
    </Suspense>
  );
}
