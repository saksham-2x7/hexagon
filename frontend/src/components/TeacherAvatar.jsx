import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Placeholder Teacher Avatar
 * 
 * Once you download your Avaturn model to `public/models/teacher_avatar.glb`,
 * you can replace this component with the real useGLTF loader.
 */
export function TeacherAvatar({ currentAction = "idle", speaking = false, ...props }) {
  const group = useRef()
  const jawRef = useRef()
  const headRef = useRef()

  useFrame((state, delta) => {
    // 1. Idle Breathing Animation (bobbing up and down slightly)
    if (group.current) {
      group.current.position.y = -1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
    
    // 2. Audio-reactive Lip Sync (moving the jaw block up and down)
    if (jawRef.current) {
      if (speaking) {
        jawRef.current.position.y = -0.4 - (Math.random() * 0.15)
        // Slight head tilt when talking
        headRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.05
      } else {
        jawRef.current.position.y = -0.3
        headRef.current.rotation.z = 0
      }
    }
  })

  return (
    <group ref={group} {...props}>
      {/* Body */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.4]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Head Group */}
      <group ref={headRef} position={[0, 2.2, 0]}>
        {/* Head */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#f39c12" />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[-0.15, 0.1, 0.31]}>
          <boxGeometry args={[0.1, 0.05, 0.05]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0.15, 0.1, 0.31]}>
          <boxGeometry args={[0.1, 0.05, 0.05]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        {/* Jaw (Mouth mechanism) */}
        <mesh ref={jawRef} position={[0, -0.3, 0.25]}>
          <boxGeometry args={[0.4, 0.1, 0.3]} />
          <meshStandardMaterial color="#e67e22" />
        </mesh>
      </group>
      
      {/* Arms */}
      <mesh position={[-0.6, 1.2, 0]}>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      <mesh position={[0.6, 1.2, 0]}>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
    </group>
  )
}
