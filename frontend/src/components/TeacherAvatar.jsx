import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

/**
 * TeacherAvatar Component
 * 
 * Instructions for the Hackathon Team:
 * 1. Export your Avatar from Avaturn.me (as shown in your screenshot) in .glb format.
 * 2. Place the file at `frontend/public/models/teacher_avatar.glb`.
 * 3. Download a teaching/talking animation from Mixamo (e.g., "Talking" or "Explaining"), 
 *    convert it to .glb, and place it at `frontend/public/models/teacher_animations.glb`.
 */
export function TeacherAvatar({ currentAction = "idle", speaking = false, ...props }) {
  const group = useRef()
  
  // Load the Avaturn model (contains the mesh, bones, and ARKit blendshapes like jawOpen)
  const { nodes, materials, scene } = useGLTF('/models/teacher_avatar.glb')
  
  // Load animations (Idle, Talking, Explaining, etc.)
  const { animations } = useGLTF('/models/teacher_animations.glb')
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    // Crossfade between animations based on the currentAction prop
    // e.g., 'idle', 'explaining', 'listening'
    if (actions && actions[currentAction]) {
      actions[currentAction].reset().fadeIn(0.5).play()
      return () => {
        actions[currentAction].fadeOut(0.5)
      }
    }
  }, [currentAction, actions])

  useEffect(() => {
    // Simple audio-reactive placeholder using the jawOpen blendshape
    // Avaturn models natively support ARKit blendshapes (jawOpen, mouthSmile, etc.)
    let interval;
    if (speaking) {
      interval = setInterval(() => {
        scene.traverse((child) => {
          if (child.isMesh && child.morphTargetDictionary && child.morphTargetDictionary['jawOpen'] !== undefined) {
            const index = child.morphTargetDictionary['jawOpen'];
            // Randomize mouth opening to simulate talking
            child.morphTargetInfluences[index] = Math.random() * 0.8; 
          }
        });
      }, 100); // update every 100ms
    } else {
      // Close mouth when not speaking
      scene.traverse((child) => {
        if (child.isMesh && child.morphTargetDictionary && child.morphTargetDictionary['jawOpen'] !== undefined) {
          const index = child.morphTargetDictionary['jawOpen'];
          child.morphTargetInfluences[index] = 0;
        }
      });
    }

    return () => clearInterval(interval);
  }, [speaking, scene]);

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload('/models/teacher_avatar.glb')
useGLTF.preload('/models/teacher_animations.glb')
