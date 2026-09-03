"use client";
import { useRef, useEffect, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, useFBX } from '@react-three/drei';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';
import { useAudioLipSync } from '@/hooks/useAudioLipSync';
import * as THREE from 'three';

interface ProceduralAvatarProps {
  lookAtBoard?: boolean;
  pointAtBoard?: boolean;
}

// Inner avatar component wrapped in Suspense
function AvatarModel({ lookAtBoard = false, pointAtBoard = false }: ProceduralAvatarProps) {
  const { profile } = useAuthStore();
  const { teacherState } = useAIIntentStore();
  const { getPhonemeWeights } = useAudioLipSync();

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
  const teethMeshRef = useRef<THREE.SkinnedMesh | null>(null);

  // FBX Animations (ActorCore & Mixamo gesture suite)
  const { animations: idleClips } = useFBX('/animations/Idle.fbx');
  const { animations: explainingClips } = useFBX('/animations/Explaining.fbx');
  const { animations: pointingClips } = useFBX('/animations/Pointing.fbx');
  const { animations: greetingClips } = useFBX('/animations/Standing Greeting.fbx');

  // Clone and name clips immutably for React Compiler safety
  const animationClips = useMemo(() => {
    const list: THREE.AnimationClip[] = [];
    if (idleClips && idleClips[0]) {
      const c = idleClips[0].clone();
      c.name = 'Idle';
      list.push(c);
    }
    if (explainingClips && explainingClips[0]) {
      const c = explainingClips[0].clone();
      c.name = 'Explaining';
      list.push(c);
    }
    if (pointingClips && pointingClips[0]) {
      const c = pointingClips[0].clone();
      c.name = 'Pointing';
      list.push(c);
    }
    if (greetingClips && greetingClips[0]) {
      const c = greetingClips[0].clone();
      c.name = 'Greeting';
      list.push(c);
    }
    return list;
  }, [idleClips, explainingClips, pointingClips, greetingClips]);

  const groupRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animationClips, groupRef);
  const currentAnimRef = useRef<string>('Idle');

  // Gesture State Machine: Crossfading between ActorCore animations
  useEffect(() => {
    let targetAnim = 'Idle';
    if (pointAtBoard || teacherState === 'pointing') {
      targetAnim = 'Pointing';
    } else if (teacherState === 'teaching' || teacherState === 'speaking') {
      targetAnim = 'Explaining';
    } else if (teacherState === 'celebrating') {
      targetAnim = 'Greeting';
    }

    const prevAnim = currentAnimRef.current;
    if (actions) {
      const targetAction = actions[targetAnim];
      const prevAction = actions[prevAnim];
      if (targetAction) {
        if (prevAnim !== targetAnim && prevAction) {
          prevAction.fadeOut(0.45);
          targetAction.reset().fadeIn(0.45).play();
        } else if (!targetAction.isRunning()) {
          targetAction.reset().fadeIn(0.45).play();
        }
        currentAnimRef.current = targetAnim;
      }
    }
  }, [teacherState, pointAtBoard, actions]);

  // Traverse and bind bones, materials, and morph targets
  useEffect(() => {
    headRef.current = null;
    neckRef.current = null;
    spineRef.current = null;
    leftArmRef.current = null;
    rightArmRef.current = null;
    headMeshRef.current = null;
    teethMeshRef.current = null;

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
        if (name === 'Wolf3D_Teeth') {
          teethMeshRef.current = mesh;
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

  // Real-time smoothed phonemes (fast attack, smooth release)
  const smoothedOpennessRef = useRef(0);
  const smoothedRoundedRef = useRef(0);
  const smoothedConsonantRef = useRef(0);

  // Frame animation loop: Head tracking, breathing, natural blinking, real-time Web Audio API lip-sync
  useFrame((state, rawDelta) => {
    // CLAMP DELTA: Prevents explosive lerp overshoots (features flying out of face) when switching browser tabs
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;

    // 1. Natural Breathing (Spine & Neck subtle expansion)
    if (spineRef.current) {
      const breath = Math.sin(t * 1.8) * 0.015;
      spineRef.current.rotation.x = THREE.MathUtils.lerp(spineRef.current.rotation.x, breath, delta * 3);
    }

    // 2. Gaze & Head Tracking (Look at student cursor, blackboard, or thoughtful tilt)
    if (headRef.current) {
      let targetYaw = 0;
      let targetPitch = 0;
      let targetRoll = 0;

      if (lookAtBoard || pointAtBoard || teacherState === 'pointing') {
        // Turn gently towards digital chalkboard on the right
        targetYaw = 0.45;
        targetPitch = 0.05;
      } else if (teacherState === 'thinking') {
        // Expressive pensive tilt
        targetYaw = 0.18;
        targetPitch = 0.12;
        targetRoll = 0.08;
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
      headRef.current.rotation.z = THREE.MathUtils.lerp(
        headRef.current.rotation.z,
        targetRoll,
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

      // 4. Real-time Web Audio API Lip-Sync & Multi-Band Formant Analysis
      const phonemes = getPhonemeWeights();
      const audioVolume = phonemes.volume;

      // Morph target indices supporting both standard and Ready Player Me conventions
      const mouthOpenIdx = dict['mouthOpen'] ?? dict['viseme_aa'] ?? dict['viseme_AA'];
      const visemeOIdx = dict['viseme_O'] ?? dict['viseme_o'] ?? dict['viseme_U'];
      const visemeIIdx = dict['viseme_I'] ?? dict['viseme_i'] ?? dict['viseme_E'];

      if (audioVolume > 0.015) {
        // Real-time Web Audio API speech driving the mouth morph targets
        // Fast attack (delta * 24) so syllables open immediately; smooth decay (delta * 16)
        smoothedOpennessRef.current = THREE.MathUtils.lerp(
          smoothedOpennessRef.current,
          Math.min(phonemes.openness * 1.35, 1.0),
          delta * 24
        );
        smoothedRoundedRef.current = THREE.MathUtils.lerp(
          smoothedRoundedRef.current,
          Math.min(phonemes.rounded * 1.25, 1.0),
          delta * 22
        );
        smoothedConsonantRef.current = THREE.MathUtils.lerp(
          smoothedConsonantRef.current,
          Math.min(phonemes.consonant * 0.9, 0.8),
          delta * 20
        );

        if (mouthOpenIdx !== undefined) influences[mouthOpenIdx] = smoothedOpennessRef.current;
        if (visemeOIdx !== undefined) influences[visemeOIdx] = smoothedRoundedRef.current;
        if (visemeIIdx !== undefined) influences[visemeIIdx] = smoothedConsonantRef.current;

        // Synchronize teeth morph targets if present
        if (teethMeshRef.current && teethMeshRef.current.morphTargetDictionary && teethMeshRef.current.morphTargetInfluences) {
          const tDict = teethMeshRef.current.morphTargetDictionary;
          const tInf = teethMeshRef.current.morphTargetInfluences;
          const tOpenIdx = tDict['mouthOpen'] ?? tDict['viseme_aa'] ?? tDict['viseme_AA'];
          if (tOpenIdx !== undefined) tInf[tOpenIdx] = smoothedOpennessRef.current;
        }
      } else if (isSpeaking) {
        // Natural procedural speech fallback when teacherState is speaking but audio is silent/pending
        const speechIntensity = Math.abs(Math.sin(t * 9) * Math.cos(t * 14));
        const oIntensity = Math.abs(Math.sin(t * 6));

        if (mouthOpenIdx !== undefined) {
          influences[mouthOpenIdx] = THREE.MathUtils.lerp(influences[mouthOpenIdx], speechIntensity * 0.75, delta * 15);
        }
        if (visemeOIdx !== undefined) {
          influences[visemeOIdx] = THREE.MathUtils.lerp(influences[visemeOIdx], oIntensity * 0.4, delta * 12);
        }
      } else {
        // Resting neutral state
        smoothedOpennessRef.current = THREE.MathUtils.lerp(smoothedOpennessRef.current, 0, delta * 12);
        smoothedRoundedRef.current = THREE.MathUtils.lerp(smoothedRoundedRef.current, 0, delta * 12);
        smoothedConsonantRef.current = THREE.MathUtils.lerp(smoothedConsonantRef.current, 0, delta * 12);

        if (mouthOpenIdx !== undefined) influences[mouthOpenIdx] = smoothedOpennessRef.current;
        if (visemeOIdx !== undefined) influences[visemeOIdx] = smoothedRoundedRef.current;
        if (visemeIIdx !== undefined) influences[visemeIIdx] = smoothedConsonantRef.current;
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
useFBX.preload('/animations/Idle.fbx');
useFBX.preload('/animations/Explaining.fbx');
useFBX.preload('/animations/Pointing.fbx');
useFBX.preload('/animations/Standing Greeting.fbx');
