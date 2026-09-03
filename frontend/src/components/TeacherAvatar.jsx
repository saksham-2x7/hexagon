import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function TeacherAvatar({ currentAction = "idle", speaking = false, ...props }) {
  const group = useRef()
  
  // This will load the REAL 3D model you export from Avaturn.
  const { nodes, materials, scene } = useGLTF('/models/teacher_avatar.glb')
  
  // (Optional) Load animations if you have them, otherwise just render the model
  let actions = null;
  try {
    const animData = useGLTF('/models/teacher_animations.glb');
    const anim = useAnimations(animData.animations, group);
    actions = anim.actions;
  } catch (e) {
    console.warn("No animations file found, rendering static model.");
  }

  useEffect(() => {
    if (actions && actions[currentAction]) {
      actions[currentAction].reset().fadeIn(0.5).play()
      return () => {
        actions[currentAction].fadeOut(0.5)
      }
    }
  }, [currentAction, actions])

  useEffect(() => {
    // Audio-reactive lip sync for the REAL Avaturn model
    let interval;
    if (speaking) {
      interval = setInterval(() => {
        scene.traverse((child) => {
          if (child.isMesh && child.morphTargetDictionary && child.morphTargetDictionary['jawOpen'] !== undefined) {
            const index = child.morphTargetDictionary['jawOpen'];
            child.morphTargetInfluences[index] = Math.random() * 0.8; 
          }
        });
      }, 100);
    } else {
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
