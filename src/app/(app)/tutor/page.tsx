"use client";
import { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Expand, Shrink, BookOpen, Activity, Target, Clock, Zap } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import ProceduralAvatar from '../../../components/teacher/ProceduralAvatar';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';
import * as THREE from 'three';

// Premium Ready Player Me Models (Public Samples)



export default function TutorPage() {
  const { profile } = useAuthStore();
  const { teacherState, setTeacherState } = useAIIntentStore();
  
  const isMale = profile?.tutorGender === 'male';
  const name = isMale ? 'ALEX' : 'ARIA';
  
  
  const isSpeaking = teacherState === 'speaking' || teacherState === 'teaching';
  
  const [messages, setMessages] = useState([
    { role: 'teacher', text: `Hello! I'm ${name}, your AI tutor. Today we're exploring Neural Networks. What would you like to focus on?`, time: '03:19 PM' }
  ]);
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (overrideText?: string) => {
    const text = overrideText || input;
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setInput('');
    setTeacherState('thinking', '');
    
    setTimeout(() => {
      setTeacherState('speaking', '');
      setMessages(prev => [...prev, { 
        role: 'teacher', 
        text: "Great choice! Let's break it down. A neural network learns by adjusting the weights in its connections based on the error between its prediction and the actual output.", 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
      setTimeout(() => setTeacherState('listening', ''), 5000);
    }, 1500);
  };

  const QUICK_ACTIONS = ['Explain differently', 'Show me visually', 'Give an example', 'Quiz me'];

  return (
    <div className="flex h-full bg-background text-hexagon-text-primary">
      
      {/* LEFT: Full Vertical Avatar */}
      <div className="w-2/5 h-full relative border-r border-hexagon-border overflow-hidden bg-hexagon-surface">
        <Canvas camera={{ position: [0, 0.1, 1.5], fov: 35 }} className="w-full h-full">
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 5, 2]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-3, 2, -2]} intensity={1} color="#00FF9D" />
          <Environment preset="city" />
          
          <ProceduralAvatar />

          <ContactShadows position={[0, -1.6, 0]} opacity={0.7} scale={10} blur={2} far={4} />
          <OrbitControls 
             enableZoom={false} 
             enablePan={false} 
             maxPolarAngle={Math.PI/2} 
             minPolarAngle={Math.PI/3}
             minAzimuthAngle={-Math.PI/4}
             maxAzimuthAngle={Math.PI/4}
          />
        </Canvas>

        {/* Minimal status overlay */}
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-background/60 backdrop-blur-md border border-hexagon-border px-4 py-2 rounded-full shadow-lg">
          <div className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-hexagon-accent animate-pulse' : 'bg-hexagon-text-secondary'}`} />
          <span className="text-sm font-semibold tracking-wide">{name}</span>
        </div>
      </div>

      {/* RIGHT: Chat Interface */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="h-16 border-b border-hexagon-border bg-background/50 backdrop-blur-sm flex items-center px-8 flex-shrink-0">
           <h2 className="font-semibold text-lg flex items-center gap-2">
             <Zap className="w-5 h-5 text-hexagon-accent" /> Neural Networks
           </h2>
        </div>

        {/* Chat Bubbles */}
        <div ref={chatRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide pb-32">
          {messages.map((m, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex flex-col max-w-[80%] ${m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              {m.role === 'teacher' && (
                <span className="text-xs text-hexagon-text-secondary mb-1.5 ml-1 font-medium tracking-wide">
                  {name} • {m.time}
                </span>
              )}
              <div className={`p-5 text-[15px] leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-hexagon-accent text-black font-medium rounded-3xl rounded-tr-sm' 
                  : 'bg-hexagon-surface border border-hexagon-border rounded-3xl rounded-tl-sm'
              }`}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {teacherState === 'thinking' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start max-w-[80%]">
               <div className="p-5 bg-hexagon-surface border border-hexagon-border rounded-3xl rounded-tl-sm flex gap-2 items-center">
                 {[1,2,3].map(i => (
                   <motion.div key={i} className="w-2 h-2 bg-hexagon-text-secondary rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} />
                 ))}
               </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background via-background to-transparent pt-12">
          {/* Quick Actions (Small pills above input) */}
          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_ACTIONS.map(action => (
              <button 
                key={action}
                onClick={() => handleSend(action)}
                className="px-4 py-2 rounded-full bg-hexagon-surface border border-hexagon-border text-sm font-medium hover:border-hexagon-accent hover:text-hexagon-accent transition-colors"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Text Input */}
          <div className="relative flex items-center bg-hexagon-surface border border-hexagon-border rounded-2xl shadow-xl focus-within:border-hexagon-accent transition-colors">
            <button className="absolute left-4 p-2 text-hexagon-text-secondary hover:text-hexagon-text-primary transition-colors rounded-full hover:bg-background">
              <Mic className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={`Ask ${name} anything...`}
              className="w-full bg-transparent border-none py-5 pl-14 pr-16 text-hexagon-text-primary placeholder:text-hexagon-text-secondary outline-none"
            />
            <button 
              onClick={() => handleSend()}
              className="absolute right-3 p-2.5 bg-hexagon-accent text-black rounded-xl hover:bg-hexagon-accent/90 transition-colors"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
