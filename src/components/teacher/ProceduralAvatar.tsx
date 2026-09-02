"use client";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useAuthStore } from "@/store/useAuthStore";
import { useAIIntentStore } from "@/store/useAIIntentStore";
import * as THREE from "three";

export default function ProceduralAvatar() {
  const { profile } = useAuthStore();
  const { teacherState } = useAIIntentStore();
  
  const group = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const chestRef = useRef<THREE.Mesh>(null);

  const gender = profile?.tutorGender || "female";
  const isSpeaking = teacherState === "speaking" || teacherState === "teaching" || teacherState === "correcting" || teacherState === "celebrating";
  
  // Base colors
  const skinColor = "#f0cbb5";
  const eyeColor = gender === "female" ? "#8b5cf6" : "#3b82f6"; // Purple or Blue
  const shirtColor = "#111111";
  const hairColor = "#222222";

  const [blink, setBlink] = useState(false);

  // Blinking logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150); // blink duration
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Gaze / Mouse tracking
    if (headRef.current) {
      // Gentle floating breathing
      const breathe = Math.sin(time * 2) * 0.05;
      group.current!.position.y = -1.2 + breathe;

      // Mouse tracking
      const targetX = (state.pointer.x * Math.PI) / 6;
      const targetY = (state.pointer.y * Math.PI) / 8;
      
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY, 0.1);
      
      // Eyes follow slightly more
      if (leftEyeRef.current && rightEyeRef.current) {
        const eyeTargetX = targetX * 0.2;
        const eyeTargetY = targetY * 0.2;
        leftEyeRef.current.position.x = -0.3 + eyeTargetX;
        rightEyeRef.current.position.x = 0.3 + eyeTargetX;
      }
    }

    // Blinking
    if (leftEyeRef.current && rightEyeRef.current) {
      const targetScaleY = blink ? 0.1 : 1;
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, targetScaleY, 0.3);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, targetScaleY, 0.3);
    }

    // Mouth animation (lipsync mock)
    if (mouthRef.current) {
      if (isSpeaking) {
        const open = 0.5 + Math.sin(time * 15) * 0.5; // rapid mouth movement
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, Math.max(0.2, open), 0.2);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 0.8 + Math.sin(time * 10) * 0.2, 0.2);
      } else {
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.2, 0.2);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1, 0.2);
      }
    }
  });

  return (
    <group ref={group} position={[0, -1.2, 0]}>
      {/* Body / Shoulders */}
      <mesh ref={chestRef} position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.9, 1.2, 1.5, 32]} />
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.5, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.4} />
      </mesh>

      {/* Head Group */}
      <group ref={headRef} position={[0, 0.6, 0]}>
        {/* Face/Head Base */}
        <mesh>
          <sphereGeometry args={[0.8, 64, 64]} />
          <meshStandardMaterial color={skinColor} roughness={0.4} />
        </mesh>

        {/* Hair */}
        {gender === "female" ? (
          <mesh position={[0, 0.2, -0.1]}>
            <sphereGeometry args={[0.85, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
            <meshStandardMaterial color={hairColor} roughness={0.7} />
          </mesh>
        ) : (
          <mesh position={[0, 0.3, -0.05]}>
            <sphereGeometry args={[0.82, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
            <meshStandardMaterial color={hairColor} roughness={0.8} />
          </mesh>
        )}

        {/* Glasses (Optional styling for intelligent look) */}
        <group position={[0, 0.1, 0.78]}>
          <mesh position={[-0.3, 0, 0]}>
            <torusGeometry args={[0.18, 0.02, 16, 32]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.3, 0, 0]}>
            <torusGeometry args={[0.18, 0.02, 16, 32]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.2, 0.02, 0.02]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>

        {/* Eyes */}
        <mesh ref={leftEyeRef} position={[-0.3, 0.1, 0.72]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} />
        </mesh>
        <mesh ref={rightEyeRef} position={[0.3, 0.1, 0.72]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.1, 0.8]}>
          <coneGeometry args={[0.08, 0.2, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} />
        </mesh>

        {/* Mouth */}
        <mesh ref={mouthRef} position={[0, -0.35, 0.75]}>
          <capsuleGeometry args={[0.04, 0.1, 4, 8]} />
          <meshStandardMaterial color="#4a1525" />
        </mesh>
      </group>
    </group>
  );
}
