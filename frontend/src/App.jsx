import React, { useState } from 'react'
import AvatarCanvas from './components/AvatarCanvas'

export default function App() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <AvatarCanvas action="idle" isSpeaking={isSpeaking} />
      
      <div style={{
        position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.9)', padding: '15px 30px',
        borderRadius: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        display: 'flex', gap: '20px', alignItems: 'center', zIndex: 10
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>AI Teacher Controls</h3>
        <button 
          onClick={() => setIsSpeaking(!isSpeaking)}
          style={{
            padding: '10px 20px', borderRadius: '20px', border: 'none',
            background: isSpeaking ? '#ff4757' : '#2ed573', color: 'white',
            fontWeight: 'bold', cursor: 'pointer', outline: 'none'
          }}
        >
          {isSpeaking ? 'Stop Talking' : 'Start Talking'}
        </button>
      </div>
    </div>
  )
}
