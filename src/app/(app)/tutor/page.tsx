"use client";
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Play, Pause, Maximize, ChevronRight, Activity, BookOpen, Clock, Zap, Target } from 'lucide-react';
import ProceduralAvatar from '../../../components/teacher/ProceduralAvatar';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';

export default function TutorPage() {
  const { profile } = useAuthStore();
  const { teacherState, setTeacherState } = useAIIntentStore();
  const isSpeaking = teacherState === 'speaking' || teacherState === 'teaching';
  
  const [messages, setMessages] = useState([
    { role: 'teacher', text: `Hello! I'm ${profile?.tutorGender === 'male' ? 'ALEX' : 'ARIA'}, your AI tutor. Today we're exploring Neural Networks. What would you like to focus on?`, time: '03:19 PM' }
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
        text: "Great choice! Let's break it down. A neural network learns by adjusting the weights in its connections based on the error between its prediction and the actual output. I'll show you visually.", 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
      setTimeout(() => setTeacherState('listening', ''), 5000);
    }, 1500);
  };

  const name = profile?.tutorGender === 'male' ? 'ALEX' : 'ARIA';

  return (
    <div className="flex h-full bg-[#050505] text-hexagon-text-primary overflow-hidden">
      
      {/* LEFT: Portrait Avatar */}
      <div className="w-[35%] relative flex flex-col p-6 pr-3">
        <div className="flex-1 rounded-3xl overflow-hidden bg-gradient-to-b from-[#0a0f12] to-[#05080a] relative border border-white/5 shadow-2xl flex flex-col">
          <Canvas camera={{ position: [0, 0.5, 3.5], fov: 35 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 5, 2]} intensity={1.5} color="#ffffff" />
            <directionalLight position={[-3, 2, -2]} intensity={1} color="#00FF9D" />
            <Environment preset="city" />
            <ProceduralAvatar />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.5} scale={10} blur={2} far={4} />
            <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI/2} minPolarAngle={Math.PI/3} />
          </Canvas>
          
          {/* Avatar Overlay Controls */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl w-fit shadow-lg">
              <div className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-hexagon-accent animate-pulse' : 'bg-hexagon-text-secondary'}`} />
              <span className="text-sm font-semibold tracking-wide">{name} • {isSpeaking ? 'Teaching' : 'Listening'}</span>
              {isSpeaking && (
                <div className="flex items-center gap-1 ml-2 opacity-80">
                   {[1,2,3,4].map(i => (
                     <motion.div key={i} className="w-1 bg-hexagon-accent rounded-full"
                       animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                     />
                   ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium">
                <Mic className="w-4 h-4" /> Speak
              </button>
              <button className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium">
                <Pause className="w-4 h-4" /> Pause
              </button>
              <button className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium">
                <Maximize className="w-4 h-4" /> Fullscreen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE: Chat Interface */}
      <div className="flex-1 flex flex-col px-3 py-6 relative">
        <div ref={chatRef} className="flex-1 overflow-y-auto space-y-6 pb-20 pr-4 scrollbar-hide">
          {messages.map((m, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              {m.role === 'teacher' && (
                <span className="text-xs text-hexagon-text-secondary mb-1.5 ml-1 font-medium tracking-wide">
                  {name} • {m.time}
                </span>
              )}
              {m.role === 'user' && (
                <span className="text-xs text-hexagon-text-secondary mb-1.5 mr-1 font-medium tracking-wide">
                  {m.time}
                </span>
              )}
              <div className={`p-5 text-[15px] leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-hexagon-surface border border-white/5 rounded-3xl rounded-tr-sm' 
                  : 'bg-gradient-to-br from-hexagon-surface to-transparent border border-white/5 rounded-3xl rounded-tl-sm'
              }`}>
                {/* Simulated markdown parsing for 'weights' highlight */}
                {m.text.split('weights').map((part, idx, arr) => (
                  <span key={idx}>
                    {part}
                    {idx < arr.length - 1 && <span className="text-hexagon-accent font-semibold">weights</span>}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
          {teacherState === 'thinking' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start max-w-[85%]">
               <div className="p-4 bg-hexagon-surface border border-white/5 rounded-3xl rounded-tl-sm flex gap-2">
                 {[1,2,3].map(i => (
                   <motion.div key={i} className="w-2 h-2 bg-hexagon-text-secondary rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }} />
                 ))}
               </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-6 left-3 right-3 flex flex-col gap-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {['Explain differently', 'Show me visually', 'Give an example', 'Quiz me'].map(s => (
              <button 
                key={s} 
                onClick={() => handleSend(s)}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-hexagon-accent/10 border border-hexagon-accent/20 text-hexagon-accent text-sm font-medium hover:bg-hexagon-accent/20 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative flex items-center bg-hexagon-surface border border-white/10 rounded-2xl shadow-xl">
            <button className="absolute left-4 p-2 text-hexagon-text-secondary hover:text-white transition-colors rounded-full hover:bg-white/5">
              <Mic className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={`Ask ${name} anything...`}
              className="w-full bg-transparent border-none py-5 pl-14 pr-16 text-white placeholder:text-hexagon-text-secondary outline-none"
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

      {/* RIGHT: Quick Actions & Context */}
      <div className="w-[28%] flex flex-col p-6 pl-3 space-y-6 overflow-y-auto scrollbar-hide">
        
        {/* Progress Card */}
        <div className="bg-hexagon-surface border border-white/5 rounded-3xl p-6">
          <h3 className="text-sm font-semibold text-white mb-6 tracking-wide">Session Progress</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="40" cy="40" r="36" fill="none" stroke="#00FF9D" strokeWidth="8" strokeDasharray="226" strokeDashoffset="124" className="transition-all duration-1000" />
              </svg>
              <span className="absolute text-xl font-bold">45<span className="text-sm">%</span></span>
            </div>
            <div>
              <p className="font-semibold text-white text-lg">Neural Networks</p>
              <p className="text-hexagon-accent text-sm font-medium mt-1">Understanding</p>
            </div>
          </div>
        </div>

        {/* Quick Actions List */}
        <div className="bg-hexagon-surface border border-white/5 rounded-3xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 tracking-wide flex items-center gap-2">
            <Zap className="w-4 h-4 text-hexagon-accent" /> Quick Actions
          </h3>
          <div className="space-y-1">
            {[
              { label: 'Explain differently', icon: BookOpen },
              { label: 'Show me visually', icon: Activity },
              { label: 'Give an example', icon: Target },
              { label: 'Quiz me', icon: Clock },
              { label: 'I don\'t understand', icon: Mic },
              { label: 'Go deeper', icon: ChevronRight },
            ].map(action => (
              <button key={action.label} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-hexagon-text-secondary group-hover:text-white transition-colors">
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-hexagon-text-secondary group-hover:text-white transition-colors">{action.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-hexagon-text-secondary/50 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* About Card */}
        <div className="bg-hexagon-surface border border-white/5 rounded-3xl p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-white tracking-wide">About this Topic</h3>
          <p className="text-sm text-hexagon-text-secondary leading-relaxed">
            Neural Networks are a foundational concept in machine learning. They are inspired by the human brain and are used for classification, regression, and more.
          </p>
          <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-hexagon-accent font-semibold py-3.5 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 mt-2">
            View Learning Path <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
