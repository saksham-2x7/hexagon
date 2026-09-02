"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, MessageSquare, BookOpen, Layers } from 'lucide-react';
import ProceduralAvatar from '../../../components/teacher/ProceduralAvatar';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

export default function TutorPage() {
  const [messages, setMessages] = useState([
    { role: 'teacher', text: "Hello! I'm ready for our session. What would you like to focus on today?" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'teacher', text: `That's a great topic. I'll load up a lesson on ${currentInput} for us.` }]);
    }, 1500);
  };

  return (
    <div className="flex h-full">
      {/* Avatar Panel */}
      <div className="w-1/3 bg-hexagon-surface border-r border-hexagon-border p-6 flex flex-col items-center">
        <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black relative mb-6 border border-hexagon-border shadow-2xl">
          <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            <Environment preset="city" />
            <ProceduralAvatar />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-hexagon-accent flex items-center gap-2 border border-hexagon-accent/30">
            <span className="w-2 h-2 rounded-full bg-hexagon-accent animate-pulse" />
            ARIA - Teaching
          </div>
        </div>
        
        <div className="w-full space-y-2">
          <h3 className="text-hexagon-text-primary font-semibold mb-4 text-sm uppercase tracking-wider">Quick Actions</h3>
          {['Explain differently', 'Show me visually', 'Give me an example', 'Quiz me'].map(act => (
            <button key={act} className="w-full p-3 text-sm text-left bg-background border border-hexagon-border rounded-xl hover:bg-hexagon-surface-hover hover:border-hexagon-accent/30 text-hexagon-text-secondary hover:text-hexagon-text-primary transition-colors">
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-hexagon-accent text-black rounded-tr-sm' : 'bg-hexagon-surface border border-hexagon-border text-hexagon-text-primary rounded-tl-sm'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-hexagon-border bg-hexagon-surface">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask your AI tutor anything..."
              className="w-full bg-background border border-hexagon-border rounded-xl py-4 pl-4 pr-16 text-hexagon-text-primary focus:border-hexagon-accent/50 outline-none transition-colors"
            />
            <div className="absolute right-2 flex gap-1">
              <button className="p-2 text-hexagon-text-secondary hover:text-hexagon-text-primary transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button onClick={handleSend} className="p-2 text-hexagon-accent hover:text-hexagon-accent/80 transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
