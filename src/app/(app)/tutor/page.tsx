"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Zap, UserCircle2, CheckCircle2 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';
import ProceduralAvatar from '../../../components/teacher/ProceduralAvatar';
import { NeuralNetworkBoard } from '../../../components/teacher/NeuralNetworkBoard';

export default function TutorPage() {
  const { profile, updateProfile } = useAuthStore();
  const { teacherState, setTeacherState } = useAIIntentStore();
  
  const isMale = profile?.tutorGender === 'male';
  const name = isMale ? 'ALEX' : 'ARIA';
  
  // State Machine for Demo
  const [demoState, setDemoState] = useState<'intro' | 'explain_weights' | 'wait_for_slider' | 'slider_moved' | 'evaluate_answer' | 'success'>('intro');
  const [weight, setWeight] = useState(1.0);
  const [caption, setCaption] = useState("");
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [input, setInput] = useState('');
  const [showSelector, setShowSelector] = useState(false);

  // Demo sequence orchestration
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    const speak = (text: string, state: import('@/types/teacher').TeacherState = 'speaking', duration: number = 3000) => {
      setCaption(text);
      setTeacherState(state, text);
      return new Promise(resolve => setTimeout(resolve, duration));
    };

    const runDemo = async () => {
      if (demoState === 'intro') {
        await speak(`Welcome! I'm ${name}, your AI Tutor. Let's build a Neural Network.`, 'teaching', 4000);
        await speak("On the board, you see the Input, Hidden, and Output layers.", 'pointing', 4000);
        setDemoState('explain_weights');
      } else if (demoState === 'explain_weights') {
        await speak("The connections between neurons have 'weights'. These determine the signal strength.", 'teaching', 5000);
        await speak("Try adjusting the weight (w₁) on the board to see how it affects the network.", 'pointing', 4000);
        setDemoState('wait_for_slider');
        setTeacherState('listening', '');
        setCaption("Waiting for you to adjust the weight...");
      } else if (demoState === 'slider_moved') {
        await speak(`Great! You set the weight to ${weight.toFixed(2)}.`, 'celebrating', 3000);
        await speak("If we want the network to output a MATCH, should the weight be higher or lower than 1.0?", 'questioning', 5000);
        setDemoState('evaluate_answer');
        setTeacherState('listening', '');
        setCaption("Type your answer below...");
      } else if (demoState === 'success') {
        await speak("Exactly! Increasing the weight amplifies the signal to match the target pattern.", 'celebrating', 5000);
        await speak("You're a natural at this. Let's move on to Backpropagation!", 'teaching', 4000);
        setTeacherState('idle', '');
        setCaption("");
      }
    };

    runDemo();

    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [demoState, name, setTeacherState]); // Removed weight from dependency to prevent re-running demo on slider move

  const handleWeightChange = (val: number) => {
    setWeight(val);
    if (demoState === 'wait_for_slider') {
      setDemoState('slider_moved');
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    
    if (demoState === 'evaluate_answer') {
      const isCorrect = input.toLowerCase().includes('higher') || input.toLowerCase().includes('increase');
      setInput('');
      
      if (isCorrect) {
        setDemoState('success');
      } else {
        setCaption("Not quite. Think about strengthening the signal. Try again!");
        setTeacherState('correcting', 'Not quite.');
        setTimeout(() => setTeacherState('listening', ''), 3000);
      }
    } else {
      setInput('');
    }
  };

  return (
    <div className="flex h-full w-full bg-background text-hexagon-text-primary overflow-hidden relative">
      
      {/* LEFT: Full Vertical 3D Teacher */}
      <div className="w-[35%] h-full relative border-r border-hexagon-border bg-hexagon-surface/50">
        <Canvas camera={{ position: [0, 0.2, 2.5], fov: 40 }} className="w-full h-full">
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 5, 2]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-3, 2, -2]} intensity={1} color="#00FF9D" />
          <Environment preset="city" />
          
          <ProceduralAvatar 
            lookAtBoard={demoState !== 'intro'} 
            pointAtBoard={teacherState === 'pointing'} 
          />

          <ContactShadows position={[0, -1.6, 0]} opacity={0.7} scale={10} blur={2} far={4} />
          <OrbitControls enableZoom={true} minDistance={1.5} maxDistance={5} enablePan={false} />
        </Canvas>

        {/* Teacher Controls Overlay */}
        <div className="absolute top-6 left-6 flex items-center justify-between right-6 z-20 pointer-events-auto">
          <div className="flex items-center gap-3 bg-background/60 backdrop-blur-md border border-hexagon-border px-4 py-2 rounded-full shadow-lg">
            <div className={`w-2.5 h-2.5 rounded-full ${teacherState !== 'idle' ? 'bg-hexagon-accent animate-pulse' : 'bg-hexagon-text-secondary'}`} />
            <span className="text-sm font-semibold tracking-wide">{name}</span>
          </div>
          <button 
            onClick={() => setShowSelector(true)}
            className="bg-background/60 backdrop-blur-md border border-hexagon-border px-3 py-2 rounded-full hover:bg-hexagon-surface/50 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <UserCircle2 className="w-4 h-4" /> Change Tutor
          </button>
        </div>
      </div>

      {/* RIGHT: Digital Classroom Board & Chat */}
      <div className="flex-1 flex flex-col relative p-6 gap-6">
        
        {/* Large Teaching Board */}
        <div className="flex-1 w-full rounded-[2rem] overflow-hidden">
          <NeuralNetworkBoard 
            demoState={demoState}
            weightValue={weight}
            onWeightChange={handleWeightChange}
          />
        </div>

        {/* Captions & Controls Bottom Area */}
        <div className="h-48 flex gap-6 shrink-0">
          
          {/* Captions/Subtitle Box */}
          <div className="flex-1 bg-hexagon-surface/50 border border-hexagon-border rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-4 left-4 flex items-center gap-2">
               <Mic className={`w-4 h-4 ${teacherState !== 'idle' && teacherState !== 'listening' ? 'text-hexagon-accent animate-pulse' : 'text-gray-400'}`} />
               <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transcripts</span>
            </div>
            <p className="text-2xl font-medium text-center leading-relaxed mt-4">
              {caption}
            </p>
          </div>

          {/* Secondary Chat / Input Area */}
          <div className="w-1/3 bg-hexagon-surface/50 border border-hexagon-border rounded-3xl p-4 flex flex-col">
             <div className="flex-1 overflow-y-auto mb-4 space-y-2 scrollbar-hide flex flex-col justify-end">
                {messages.slice(-3).map((m, i) => (
                  <div key={i} className="bg-hexagon-surface p-3 rounded-2xl text-sm border border-hexagon-border ml-auto max-w-[90%]">
                    {m.text}
                  </div>
                ))}
             </div>
             <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Reply to teacher..."
                  className="w-full bg-hexagon-surface border border-hexagon-border py-3 pl-4 pr-12 rounded-xl text-sm outline-none focus:border-hexagon-accent transition-colors"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1.5 p-1.5 bg-hexagon-accent text-black rounded-lg hover:bg-hexagon-accent/90"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* TEACHER SELECTION MODAL */}
      <AnimatePresence>
        {showSelector && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-hexagon-surface/50 border border-hexagon-border rounded-[2rem] p-8 w-[800px] shadow-2xl flex flex-col"
            >
              <h2 className="text-2xl font-bold mb-2">Select Your AI Tutor</h2>
              <p className="text-gray-400 mb-8">Choose the personality and teaching style that fits your learning journey.</p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* ARIA */}
                <button 
                  onClick={() => { updateProfile({ tutorGender: 'female' }); setShowSelector(false); }}
                  className={`flex flex-col text-left p-6 rounded-3xl border-2 transition-all ${!isMale ? 'border-hexagon-accent bg-hexagon-surface shadow-md' : 'border-hexagon-border bg-hexagon-surface hover:border-gray-500'}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">ARIA</h3>
                    {!isMale && <CheckCircle2 className="w-6 h-6 text-hexagon-accent" />}
                  </div>
                  <p className="text-sm text-gray-400 mb-4">Warm, thoughtful, patient, intelligent. Specializes in deep conceptual understanding and Socratic questioning.</p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-background rounded-md">Patient</span>
                    <span className="text-xs px-2 py-1 bg-background rounded-md">Socratic</span>
                  </div>
                </button>

                {/* ALEX */}
                <button 
                  onClick={() => { updateProfile({ tutorGender: 'male' }); setShowSelector(false); }}
                  className={`flex flex-col text-left p-6 rounded-3xl border-2 transition-all ${isMale ? 'border-blue-500 bg-hexagon-surface shadow-md' : 'border-hexagon-border bg-hexagon-surface hover:border-gray-500'}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">ALEX</h3>
                    {isMale && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
                  </div>
                  <p className="text-sm text-gray-400 mb-4">Confident, analytical, energetic, practical. Focuses on rapid problem solving and applied knowledge.</p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-background rounded-md">Analytical</span>
                    <span className="text-xs px-2 py-1 bg-background rounded-md">Energetic</span>
                  </div>
                </button>
              </div>
              
              <button onClick={() => setShowSelector(false)} className="self-end px-6 py-2 bg-background border border-hexagon-border rounded-xl font-medium hover:bg-white/5 transition-colors">
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
