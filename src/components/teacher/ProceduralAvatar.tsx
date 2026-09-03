"use client";
import { useRef, useEffect, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, useFBX } from '@react-three/drei';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';
import * as THREE from 'three';

interface ProceduralAvatarProps {
  lookAtBoard?: boolean;
  pointAtBoard?: boolean;
}

// Inner avatar component wrapped in Suspense
function AvatarModel({ lookAtBoard = false }: ProceduralAvatarProps) {
  const { profile } = useAuthStore();
  const { teacherState } = useAIIntentStore();

  const isMale = profile?.tutorGender === 'male';
  const isSpeaking =
    teacherState === 'speaking' ||
    teacherState === 'teaching' ||
    teacherState === 'correcting' ||
    teacherState === 'celebrating';

  // Authentic Ready Player Me human avatars
  const modelUrl = isMale ? '/models/alex_v2.glb' : '/models/aria_v2.glb';
  const { scene } = useGLTF(modelUrl);

  // Clone scene cleanly so instances do not conflict
  const clonedScene = useMemo(() => {
    const s = scene.clone(true);
    s.scale.set(1, 1, 1);
    return s;
  }, [scene, modelUrl]);

  // Bone references
  const headRef = useRef<THREE.Object3D | null>(null);
  const neckRef = useRef<THREE.Object3D | null>(null);
  const spineRef = useRef<THREE.Object3D | null>(null);
  const leftArmRef = useRef<THREE.Object3D | null>(null);
  const rightArmRef = useRef<THREE.Object3D | null>(null);
  const headMeshRef = useRef<THREE.SkinnedMesh | null>(null);

  // FBX Idle Animation
  let fbxClip: THREE.AnimationClip | null = null;
  try {
    const fbx = useFBX('/animations/Idle.fbx');
    if (fbx && fbx.animations && fbx.animations.length > 0) {
      fbxClip = fbx.animations[0].clone();
      fbxClip.name = 'Idle';
    }
  } catch {
    // Graceful fallback to procedural animation
  }

  const groupRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(fbxClip ? [fbxClip] : [], groupRef);

  // Play FBX idle animation if available
  useEffect(() => {
    if (actions && actions['Idle']) {
      actions['Idle'].reset().fadeIn(0.6).play();
      return () => {
        actions['Idle']?.fadeOut(0.6);
      };
    }
  }, [actions, modelUrl]);

  // Traverse and bind bones, materials, and morph targets
  useEffect(() => {
    headRef.current = null;
    neckRef.current = null;
    spineRef.current = null;
    leftArmRef.current = null;
    rightArmRef.current = null;
    headMeshRef.current = null;

    clonedScene.traverse((child) => {
      const name = child.name;

      if (name === 'Head') headRef.current = child;
      if (name === 'Neck') neckRef.current = child;
      if (name === 'Spine2' || name === 'Spine1') spineRef.current = child;
      if (name === 'LeftArm') leftArmRef.current = child;
      if (name === 'RightArm') rightArmRef.current = child;

      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const mesh = child as THREE.SkinnedMesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (name === 'Wolf3D_Head') {
          headMeshRef.current = mesh;
        }

        // Enhance material aesthetics: subtle sheen and skin tone warmth
        if (mesh.material) {
          const mat = (mesh.material as THREE.Material).clone();
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.envMapIntensity = 1.1;
            mat.roughness = Math.max(mat.roughness, 0.45);
          }
          mesh.material = mat;
        }
      }
    });
  }, [clonedScene]);

  // Blink state tracking
  const blinkTimerRef = useRef(0);
  const nextBlinkRef = useRef(3.0);
  const isBlinkingRef = useRef(false);

  // Frame animation loop: Head tracking, breathing, natural blinking, speech lip-sync
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // 1. Natural Breathing (Spine & Neck subtle expansion)
    if (spineRef.current) {
      const breath = Math.sin(t * 1.8) * 0.015;
      spineRef.current.rotation.x = THREE.MathUtils.lerp(spineRef.current.rotation.x, breath, delta * 3);
    }

    // 2. Gaze & Head Tracking (Look at user cursor, or look toward digital board)
    if (headRef.current) {
      let targetYaw = 0;
      let targetPitch = 0;

      if (lookAtBoard) {
        // Turn gently towards digital chalkboard on the right
        targetYaw = 0.45;
        targetPitch = 0.05;
      } else {
        // Softly track student's pointer for human-like eye contact
        targetYaw = (state.pointer.x * Math.PI) / 9;
        targetPitch = -(state.pointer.y * Math.PI) / 14;
      }

      // Add gentle organic micro-movements
      const microSwayYaw = Math.sin(t * 0.9) * 0.015;
      const microSwayPitch = Math.cos(t * 1.2) * 0.01;

      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        targetYaw + microSwayYaw,
        delta * 3.5
      );
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        targetPitch + microSwayPitch,
        delta * 3.5
      );
    }

    // 3. Natural Eye Blinking via Morph Targets
    blinkTimerRef.current += delta;
    if (blinkTimerRef.current >= nextBlinkRef.current) {
      isBlinkingRef.current = true;
      blinkTimerRef.current = 0;
      nextBlinkRef.current = 2.5 + Math.random() * 3.5; // Next blink in 2.5 - 6.0s
    }

    if (headMeshRef.current && headMeshRef.current.morphTargetDictionary && headMeshRef.current.morphTargetInfluences) {
      const dict = headMeshRef.current.morphTargetDictionary;
      const influences = headMeshRef.current.morphTargetInfluences;

      // Handle blink duration (~150ms)
      const blinkIdx = dict['eyesClosed'] ?? dict['eyeBlinkLeft'];
      if (blinkIdx !== undefined) {
        const targetBlink = blinkTimerRef.current < 0.16 && isBlinkingRef.current ? 1.0 : 0.0;
        influences[blinkIdx] = THREE.MathUtils.lerp(influences[blinkIdx], targetBlink, delta * 25);
        const blinkRightIdx = dict['eyeBlinkRight'];
        if (blinkRightIdx !== undefined) {
          influences[blinkRightIdx] = influences[blinkIdx];
        }
      }

      // 4. Natural Speech Visemes (Mouth movement when educator is teaching)
      const mouthOpenIdx = dict['mouthOpen'] ?? dict['viseme_AA'];
      const visemeOIdx = dict['viseme_O'];

      if (isSpeaking) {
        // Multi-frequency speech syllable simulation
        const speechIntensity = Math.abs(Math.sin(t * 9) * Math.cos(t * 14));
        const oIntensity = Math.abs(Math.sin(t * 6));

        if (mouthOpenIdx !== undefined) {
          influences[mouthOpenIdx] = THREE.MathUtils.lerp(influences[mouthOpenIdx], speechIntensity * 0.75, delta * 15);
        }
        if (visemeOIdx !== undefined) {
          influences[visemeOIdx] = THREE.MathUtils.lerp(influences[visemeOIdx], oIntensity * 0.4, delta * 12);
        }
      } else {
        // Gentle resting smile/neutral
        if (mouthOpenIdx !== undefined) {
          influences[mouthOpenIdx] = THREE.MathUtils.lerp(influences[mouthOpenIdx], 0, delta * 10);
        }
        if (visemeOIdx !== undefined) {
          influences[visemeOIdx] = THREE.MathUtils.lerp(influences[visemeOIdx], 0, delta * 10);
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Exported component with fallback
export default function ProceduralAvatar(props: ProceduralAvatarProps) {
  return (
    <Suspense fallback={null}>
      <AvatarModel {...props} />
    </Suspense>
  );
}

// Preload assets for instant switching
useGLTF.preload('/models/aria_v2.glb');
useGLTF.preload('/models/alex_v2.glb');
