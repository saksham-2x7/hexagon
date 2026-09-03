import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { TeacherAvatar } from './TeacherAvatar'

export default function AvatarCanvas({ action, isSpeaking }) {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f0f4f8' }}>
      <Canvas camera={{ position: [0, 1.5, 3], fov: 45 }}>
        {/* Soft, professional lighting for the classroom environment */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 5, 2]} intensity={1} castShadow />
        <Environment preset="city" />
        
        <Suspense fallback={null}>
          <TeacherAvatar 
            currentAction={action} 
            speaking={isSpeaking} 
            position={[0, -1, 0]} 
          />
          {/* Ground shadow to ground the avatar */}
          <ContactShadows 
            position={[0, -1, 0]} 
            opacity={0.5} 
            scale={5} 
            blur={2} 
            far={4} 
          />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          minPolarAngle={Math.PI / 2.5} 
          maxPolarAngle={Math.PI / 2} 
        />
      </Canvas>
    </div>
  )
}
