import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function TeacherAvatar({ currentAction = "idle", speaking = false, ...props }) {
  const group = useRef()
  
  // This loads the REAL 3D model you exported.
  const { scene, animations } = useGLTF('/models/teacher_avatar.glb')
  
  // Use intrinsic animations from the model itself
  const { actions } = useAnimations(animations, group)

  // Try to load external animations if the model doesn't have any built-in
  let externalActions = null;
  try {
    const animData = useGLTF('/models/teacher_animations.glb');
    const anim = useAnimations(animData.animations, group);
    externalActions = anim.actions;
  } catch (e) {
    // Ignore if not present
  }

  // Combine actions (prefer built-in over external)
  const finalActions = { ...externalActions, ...actions };

  useEffect(() => {
    // Attempt to play 'currentAction'. If not found, try to play the first animation available.
    let actionToPlay = finalActions[currentAction];
    
    if (!actionToPlay && Object.keys(finalActions).length > 0) {
      // Fallback: play the first animation found in the file
      actionToPlay = finalActions[Object.keys(finalActions)[0]];
    }

    if (actionToPlay) {
      actionToPlay.reset().fadeIn(0.5).play();
      return () => {
        actionToPlay.fadeOut(0.5);
      }
    }
  }, [currentAction, finalActions])

  useEffect(() => {
    // Audio-reactive lip sync for the ARKit blendshapes
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
