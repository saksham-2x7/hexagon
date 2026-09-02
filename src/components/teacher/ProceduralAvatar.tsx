"use client";
import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useAuthStore } from "@/store/useAuthStore";
import { useAIIntentStore } from "@/store/useAIIntentStore";
import * as THREE from "three";

export default function ProceduralAvatar() {
  const { profile } = useAuthStore();
  const { teacherState } = useAIIntentStore();
  
  const group = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);

  const gender = profile?.tutorGender || "female";
  const isFemale = gender === "female";
  
  const isSpeaking = teacherState === "speaking" || teacherState === "teaching" || teacherState === "correcting" || teacherState === "celebrating";
  
  // Premium Cyber-Human Material Palette
  const skinTone = isFemale ? "#f2d3c2" : "#e5c0a8";
  const eyeColor = isFemale ? "#00FF9D" : "#3b82f6"; // Hexagon Green for Aria, Blue for Alex
  const hairColor = isFemale ? "#181818" : "#222222";
  const blazerColor = isFemale ? "#091210" : "#11151c"; 
  const shirtColor = isFemale ? "#000000" : "#ffffff";

  // Shared Materials for performance
  const materials = useMemo(() => {
    return {
      skin: new THREE.MeshPhysicalMaterial({
        color: skinTone,
        roughness: 0.35,
        metalness: 0.1,
        clearcoat: 0.2,
        clearcoatRoughness: 0.4,
      }),
      hair: new THREE.MeshStandardMaterial({
        color: hairColor,
        roughness: 0.8,
        metalness: 0.2,
      }),
      blazer: new THREE.MeshStandardMaterial({
        color: blazerColor,
        roughness: 0.9,
        metalness: 0.1,
      }),
      shirt: new THREE.MeshStandardMaterial({
        color: shirtColor,
        roughness: 1.0,
      }),
      eyeWhite: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.1,
        metalness: 0.1,
      }),
      iris: new THREE.MeshPhysicalMaterial({
        color: eyeColor,
        emissive: eyeColor,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.8,
        clearcoat: 1.0,
      }),
      lip: new THREE.MeshPhysicalMaterial({
        color: isFemale ? "#d47777" : "#b07164",
        roughness: 0.2,
        clearcoat: 0.3,
      }),
      mouthInside: new THREE.MeshBasicMaterial({ color: "#110505" }),
      accent: new THREE.MeshStandardMaterial({
        color: eyeColor,
        emissive: eyeColor,
        emissiveIntensity: 1.5,
      })
    };
  }, [isFemale, skinTone, eyeColor, hairColor, blazerColor, shirtColor]);

  const [blink, setBlink] = useState(false);
  const targetLook = useRef(new THREE.Vector2(0, 0));

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    // Blinking logic
    if (Math.random() > 0.99) {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }

    if (group.current && headRef.current) {
      // Breathing animation
      const breathe = Math.sin(time * 2.5) * 0.015;
      group.current.position.y = -1.2 + breathe;

      // Smooth mouse tracking
      const targetX = (state.pointer.x * Math.PI) / 6;
      const targetY = (state.pointer.y * Math.PI) / 8;
      targetLook.current.lerp(new THREE.Vector2(targetX, targetY), 5 * delta);
      
      headRef.current.rotation.y = targetLook.current.x;
      headRef.current.rotation.x = -targetLook.current.y;
      headRef.current.rotation.z = -targetLook.current.x * 0.1;

      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.rotation.y = targetLook.current.x * 0.3;
        leftEyeRef.current.rotation.x = -targetLook.current.y * 0.3;
        rightEyeRef.current.rotation.y = targetLook.current.x * 0.3;
        rightEyeRef.current.rotation.x = -targetLook.current.y * 0.3;

        const blinkScale = blink ? 0.05 : 1;
        leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, blinkScale, 20 * delta);
        rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, blinkScale, 20 * delta);
      }
    }

    // Lipsync animation
    if (mouthRef.current && jawRef.current) {
      if (isSpeaking) {
        const mouthOpen = 0.5 + Math.sin(time * 25) * 0.5;
        const mouthWide = 0.8 + Math.cos(time * 15) * 0.2;
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, Math.max(0.2, mouthOpen), 15 * delta);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, mouthWide, 15 * delta);
        jawRef.current.position.y = THREE.MathUtils.lerp(jawRef.current.position.y, -0.4 - (mouthOpen * 0.04), 15 * delta);
      } else {
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.15, 15 * delta);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1, 15 * delta);
        jawRef.current.position.y = THREE.MathUtils.lerp(jawRef.current.position.y, -0.4, 15 * delta);
      }
    }
  });

  return (
    <group ref={group} position={[0, -1.2, 0]} scale={1.2}>
      {/* --- TORSO --- */}
      <group position={[0, -0.5, 0]}>
        <mesh position={[0, 0, -0.05]}>
          <cylinderGeometry args={[isFemale ? 0.9 : 1.1, isFemale ? 1.0 : 1.2, 1.8, 64]} />
          <primitive object={materials.blazer} attach="material" />
        </mesh>
        <mesh position={[0, 0.4, 0.1]}>
          <cylinderGeometry args={[0.5, 0.6, 0.8, 64]} />
          <primitive object={materials.shirt} attach="material" />
        </mesh>
        {isFemale && (
          <group position={[0, 0.45, 0.6]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.12, 0.02]} />
              <primitive object={materials.accent} attach="material" />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]} position={[-0.2, 0.2, -0.1]}>
              <cylinderGeometry args={[0.01, 0.01, 0.6]} />
              <meshStandardMaterial color="#666" />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 4]} position={[0.2, 0.2, -0.1]}>
              <cylinderGeometry args={[0.01, 0.01, 0.6]} />
              <meshStandardMaterial color="#666" />
            </mesh>
          </group>
        )}
      </group>
      
      {/* --- NECK --- */}
      <mesh position={[0, 0.5, 0.05]}>
        <cylinderGeometry args={[isFemale ? 0.25 : 0.32, isFemale ? 0.28 : 0.35, 0.6, 64]} />
        <primitive object={materials.skin} attach="material" />
      </mesh>

      {/* --- HEAD --- */}
      <group ref={headRef} position={[0, 1.1, 0.1]}>
        {/* Cranium Base */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.7, 64, 64]} />
          <primitive object={materials.skin} attach="material" />
        </mesh>
        
        {/* Face structure (Cheekbones) */}
        <mesh position={[-0.35, -0.1, 0.5]}>
           <sphereGeometry args={[0.2, 32, 32]} />
           <primitive object={materials.skin} attach="material" />
        </mesh>
        <mesh position={[0.35, -0.1, 0.5]}>
           <sphereGeometry args={[0.2, 32, 32]} />
           <primitive object={materials.skin} attach="material" />
        </mesh>

        {/* Jaw */}
        <mesh ref={jawRef} position={[0, -0.4, 0.15]}>
          <sphereGeometry args={[isFemale ? 0.55 : 0.62, 64, 64]} />
          <primitive object={materials.skin} attach="material" />
        </mesh>

        {/* Hair Styling */}
        {isFemale ? (
          <group>
            <mesh position={[0, 0.3, -0.1]}>
              <sphereGeometry args={[0.75, 64, 64, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>
            <mesh position={[0, 0.85, -0.2]}>
              <sphereGeometry args={[0.25, 32, 32]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>
            <mesh position={[-0.6, 0, 0.2]} rotation={[0, 0, -0.2]}>
              <capsuleGeometry args={[0.1, 0.4, 16, 32]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>
            <mesh position={[0.6, 0, 0.2]} rotation={[0, 0, 0.2]}>
              <capsuleGeometry args={[0.1, 0.4, 16, 32]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>
          </group>
        ) : (
          <group>
            <mesh position={[0, 0.35, -0.05]}>
              <sphereGeometry args={[0.72, 64, 64, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>
            <mesh position={[0, 0.75, 0.2]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.8, 0.2, 0.4]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>
          </group>
        )}

        {/* Eyes & Brows */}
        <group position={[0, 0.1, 0.58]}>
          <mesh position={[-0.3, 0.15, 0.05]} rotation={[0, 0, isFemale ? -0.1 : 0]}>
            <capsuleGeometry args={[0.03, 0.2, 8, 16]} />
            <primitive object={materials.hair} attach="material" />
          </mesh>
          <mesh position={[0.3, 0.15, 0.05]} rotation={[0, 0, isFemale ? 0.1 : 0]}>
            <capsuleGeometry args={[0.03, 0.2, 8, 16]} />
            <primitive object={materials.hair} attach="material" />
          </mesh>

          <group ref={leftEyeRef} position={[-0.3, 0, 0]}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.08, 32, 32]} />
              <primitive object={materials.eyeWhite} attach="material" />
            </mesh>
            <mesh position={[0, 0, 0.06]}>
              <sphereGeometry args={[0.04, 32, 32]} />
              <primitive object={materials.iris} attach="material" />
            </mesh>
          </group>

          <group ref={rightEyeRef} position={[0.3, 0, 0]}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.08, 32, 32]} />
              <primitive object={materials.eyeWhite} attach="material" />
            </mesh>
            <mesh position={[0, 0, 0.06]}>
              <sphereGeometry args={[0.04, 32, 32]} />
              <primitive object={materials.iris} attach="material" />
            </mesh>
          </group>
        </group>

        {/* Nose */}
        <mesh position={[0, -0.15, 0.68]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[isFemale ? 0.08 : 0.1, 0.25, 32]} />
          <primitive object={materials.skin} attach="material" />
        </mesh>
        
        {/* Nose bridge smooth */}
        <mesh position={[0, 0, 0.62]}>
           <cylinderGeometry args={[0.04, 0.08, 0.3, 16]} />
           <primitive object={materials.skin} attach="material" />
        </mesh>

        {/* Mouth */}
        <group position={[0, -0.4, 0.65]}>
          <mesh position={[0, 0, 0.02]}>
            <capsuleGeometry args={[isFemale ? 0.04 : 0.03, 0.15, 32, 32]} />
            <primitive object={materials.lip} attach="material" />
          </mesh>
          <mesh ref={mouthRef} position={[0, 0, 0]}>
            <boxGeometry args={[0.2, 0.05, 0.05]} />
            <primitive object={materials.mouthInside} attach="material" />
          </mesh>
        </group>

        {/* Ears */}
        <mesh position={[-0.7, 0, 0.1]} rotation={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.08, 0.2, 32, 32]} />
          <primitive object={materials.skin} attach="material" />
        </mesh>
        <mesh position={[0.7, 0, 0.1]} rotation={[0, 0.2, 0]}>
          <capsuleGeometry args={[0.08, 0.2, 32, 32]} />
          <primitive object={materials.skin} attach="material" />
        </mesh>
      </group>
    </group>
  );
}
