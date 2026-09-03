"use client";
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Send, UserCircle2, CheckCircle2, Volume2, VolumeX, 
  RotateCcw, Sparkles, Brain, Lightbulb, Compass, HelpCircle, 
  ArrowRight, Globe, Lock, Unlock, Eye, Maximize2, User,
  MessageSquare, X
} from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';
import { useAudioLipSync } from '@/hooks/useAudioLipSync';
import ProceduralAvatar from '../../../components/teacher/ProceduralAvatar';
import { NeuralNetworkBoard } from '../../../components/teacher/NeuralNetworkBoard';

type CameraViewMode = 'portrait' | 'classroom' | 'full';

function CameraDirector({ 
  viewMode, 
  orbitEnabled,
  resetTrigger
}: { 
  viewMode: CameraViewMode; 
  orbitEnabled: boolean; 
  resetTrigger: number;
}) {
  const { scene } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const transitionRef = useRef(true);
  const prevModeRef = useRef(viewMode);
  const prevResetRef = useRef(resetTrigger);

  useFrame((state, delta) => {
    // Dynamic Head Bone tracking for standard metric height (feet at Y=0)
    let headY = 1.68; // Default human head/eye height
    scene.traverse((obj) => {
      if (obj.type === 'Bone' && (obj.name === 'Head' || obj.name === 'mixamorigHead')) {
        const wp = new THREE.Vector3();
        obj.getWorldPosition(wp);
        if (wp.y > 1.2 && wp.y < 2.3) {
          headY = wp.y;
        }
      }
    });

    let targetY = headY;
    let posY = headY;
    let posZ = 1.35;

    switch (viewMode) {
      case 'portrait':
        // Dead-center on the face, eyes, smile, and gestures
        targetY = headY + 0.01;
        posY = headY + 0.02;
        posZ = 0.82;
        break;
      case 'full':
        // Full torso / upper body view
        targetY = headY - 0.38;
        posY = headY - 0.32;
        posZ = 2.30;
        break;
      case 'classroom':
      default:
        // Perfect upper-body educator framing: full head, face, shoulders, and chest
        targetY = headY - 0.10;
        posY = headY - 0.04;
        posZ = 1.55;
        break;
    }

    const targetPos = new THREE.Vector3(0, posY, posZ);
    const targetLookAt = new THREE.Vector3(0, targetY, 0);

    if (prevModeRef.current !== viewMode || prevResetRef.current !== resetTrigger) {
      prevModeRef.current = viewMode;
      prevResetRef.current = resetTrigger;
      transitionRef.current = true;
    }

    if (transitionRef.current) {
      state.camera.position.lerp(targetPos, delta * 5.0);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt, delta * 5.0);
        controlsRef.current.update();
      }
      if (state.camera.position.distanceTo(targetPos) < 0.015) {
        transitionRef.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={orbitEnabled}
      enableZoom={true}
      minDistance={0.4}
      maxDistance={3.5}
      enablePan={false}
      minPolarAngle={Math.PI / 3.4}
      maxPolarAngle={Math.PI / 1.8}
      target={[0, 1.46, 0]}
    />
  );
}

export default function TutorPage() {
  const { profile, updateProfile } = useAuthStore();
  const { teacherState, setTeacherState } = useAIIntentStore();

  const isMale = profile?.tutorGender === 'male';
  const name = isMale ? 'ALEX' : 'ARIA';
  const language = profile?.language || 'en';

  // State Machine for Demo & Curriculum
  const [demoState, setDemoState] = useState<'intro' | 'explain_weights' | 'wait_for_slider' | 'slider_moved' | 'evaluate_answer' | 'success'>('intro');
  const [weight, setWeight] = useState(1.0);
  const [caption, setCaption] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'teacher', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('classroom');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  // Teaching Phase (Round 2 Rubric)
  const phases = [
    { id: 'understand', label: 'Understand' },
    { id: 'plan', label: 'Plan' },
    { id: 'explain', label: 'Explain' },
    { id: 'demonstrate', label: 'Demonstrate' },
    { id: 'question', label: 'Question' },
    { id: 'evaluate', label: 'Evaluate' },
    { id: 'adapt', label: 'Adapt' }
  ];

  const currentPhaseIndex = useMemo(() => {
    switch (demoState) {
      case 'intro': return 1; // Plan
      case 'explain_weights': return 2; // Explain
      case 'wait_for_slider': return 3; // Demonstrate
      case 'slider_moved': return 4; // Question
      case 'evaluate_answer': return 5; // Evaluate
      case 'success': return 6; // Adapt
      default: return 0;
    }
  }, [demoState]);

  const { playTestSpeech, playAudioBuffer, getAudioContext, stopAudio } = useAudioLipSync();

  // Instant Mute Engine
  useEffect(() => {
    if (!voiceEnabled) {
      stopAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [voiceEnabled, stopAudio]);

  // Voice Speech Engine powered by ElevenLabs API with Web Speech API Fallback
  const speakVoice = async (text: string, durationMs: number = 3800) => {
    if (!voiceEnabled) return;

    // BUG FIX: Cancel any lingering browser robotic voices before ElevenLabs starts talking
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      if (!apiKey) {
        throw new Error("Missing NEXT_PUBLIC_ELEVENLABS_API_KEY in .env");
      }
      
      // Adam for Male (Alex), Rachel for Female (Aria)
      const voiceId = isMale ? "pNInz6obbfDQGcgMyIGb" : "21m00Tcm4TlvDq8ikWAM"; 
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2", // Supports English and Hindi natively
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) throw new Error("ElevenLabs API request failed.");

      const arrayBuffer = await response.arrayBuffer();
      const ctx = getAudioContext();
      if (!ctx) return;
      
      // Decode the MP3 stream into raw PCM audio and route it through the lip-sync AnalyserNode
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      playAudioBuffer(audioBuffer);

    } catch (apiError) {
      console.warn("ElevenLabs TTS failed, falling back to Web Speech:", apiError);
      
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          
          const voices = window.speechSynthesis.getVoices();
          const langPrefix = (language.toLowerCase() === 'hi') ? 'hi' : 'en';
          let localeVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
          if (localeVoices.length === 0) localeVoices = voices.filter(v => v.lang.startsWith('en'));

          const femaleNames = ['zira', 'samantha', 'victoria', 'susan', 'hazel', 'google us english', 'female', 'aditi'];
          const maleNames = ['david', 'mark', 'richard', 'alex', 'daniel', 'google uk english male', 'male', 'ravi'];

          const genderMatch = localeVoices.filter(v => {
            const lowerName = v.name.toLowerCase();
            return isMale 
              ? maleNames.some(n => lowerName.includes(n))
              : femaleNames.some(n => lowerName.includes(n));
          });

          const premiumVoices = genderMatch.filter(v => 
            v.name.toLowerCase().includes('natural') || 
            v.name.toLowerCase().includes('online')
          );

          if (premiumVoices.length > 0) {
            utterance.voice = premiumVoices[0];
          } else if (genderMatch.length > 0) {
            utterance.voice = genderMatch[0];
          } else if (localeVoices.length > 0) {
            const safeFallback = localeVoices.find(v => {
              const lowerName = v.name.toLowerCase();
              return isMale 
                ? !femaleNames.some(n => lowerName.includes(n)) 
                : !maleNames.some(n => lowerName.includes(n));
            });
            utterance.voice = safeFallback || localeVoices[0];
          }
          
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('Speech audio engine info:', e);
        }
      }
    }
  };

  // Demo sequence orchestration
  useEffect(() => {
    let isCancelled = false;

    const speak = (text: string, state: import('@/types/teacher').TeacherState = 'speaking', duration: number = 3800) => {
      if (isCancelled) return Promise.resolve();
      setCaption(text);
      setTeacherState(state, text);
      speakVoice(text, duration);
      return new Promise(resolve => setTimeout(resolve, duration));
    };

    const runDemo = async () => {
      if (demoState === 'intro') {
        await speak(`Hello! I'm ${name}, your personal AI Educator. Today we're mastering Neural Networks from first principles.`, 'teaching', 4200);
        await speak("Look at the digital board beside me. We have our Input signals, Hidden layer representations, and Output.", 'pointing', 4200);
        setDemoState('explain_weights');
      } else if (demoState === 'explain_weights') {
        await speak("Notice the connections between neurons. Each carries a mathematical 'weight' that regulates signal strength.", 'teaching', 4500);
        await speak("Try sliding weight w₁ on the board now to observe how the signal flows forward.", 'pointing', 3800);
        setDemoState('wait_for_slider');
        setTeacherState('listening', '');
        setCaption("Waiting for you to adjust the weight w₁ on the board...");
      } else if (demoState === 'slider_moved') {
        await speak(`Brilliant! You tuned weight w₁ to ${weight.toFixed(2)}.`, 'celebrating', 3200);
        await speak("Now let's check your intuition: If we need the output node to fire a strong MATCH, should we increase or decrease this weight?", 'questioning', 5000);
        setDemoState('evaluate_answer');
        setTeacherState('listening', '');
        setCaption("Question: Should we increase or decrease the weight for a stronger match? (Reply below)");
      } else if (demoState === 'success') {
        await speak("Spot on! Increasing the synaptic weight amplifies forward transmission to cross the activation threshold.", 'celebrating', 4800);
        await speak("You've mastered Forward Propagation. Shall we move forward to Backpropagation and Gradient Descent?", 'teaching', 4500);
        setTeacherState('idle', '');
        setCaption("Concept mastered! Ready for the next module.");
      }
    };

    runDemo();

    return () => {
      isCancelled = true;
    };
  }, [demoState, name, setTeacherState, voiceEnabled]);

  const handleWeightChange = (val: number) => {
    setWeight(val);
    if (demoState === 'wait_for_slider') {
      setDemoState('slider_moved');
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');

    if (demoState === 'evaluate_answer') {
      const isCorrect = userText.toLowerCase().includes('increase') || userText.toLowerCase().includes('higher') || userText.toLowerCase().includes('up') || userText.toLowerCase().includes('more');
      
      if (isCorrect) {
        setDemoState('success');
      } else {
        setCaption("Not quite! Remember, larger positive weights amplify the forward signal. Try thinking about strengthening it!");
        setTeacherState('correcting', 'Not quite.');
        speakVoice("Not quite. Remember, larger positive weights amplify the forward signal. Try again!");
        setTimeout(() => setTeacherState('listening', ''), 3500);
      }
    } else {
      // Contextual teaching response
      setTimeout(() => {
        const response = `Great question. When you explore ${userText.slice(0, 20)}..., think of how each hidden layer acts as a feature extractor. Let me know if you want an analogy!`;
        setMessages(prev => [...prev, { role: 'teacher', text: response }]);
        speakVoice(response);
      }, 1000);
    }
  };

  const triggerChip = (action: string) => {
    switch (action) {
      case 'analogy':
        setCaption("Think of weights like a volume dial: turning it up lets that specific feature speak louder to the next layer.");
        speakVoice("Think of weights like a volume dial: turning it up lets that specific feature speak louder to the next layer.");
        setTeacherState('teaching', 'Analogy');
        break;
      case 'simplify':
        setCaption("In simple terms: Weight = Importance. Higher weight means the network pays more attention to that input.");
        speakVoice("In simple terms: Weight equals importance. Higher weight means the network pays more attention to that input.");
        setTeacherState('teaching', 'Simplified');
        break;
      case 'quiz':
        setCaption("Quick pop quiz: What activation function outputs strictly between 0 and 1?");
        speakVoice("Quick pop quiz: What activation function outputs strictly between 0 and 1?");
        setTeacherState('questioning', 'Quiz');
        break;
      case 'reset':
        setDemoState('intro');
        break;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background text-hexagon-text-primary overflow-hidden relative select-none">
      
      {/* TOP BAR: Teaching Phase Progression & Language Controls */}
      <header className="h-14 border-b border-hexagon-border bg-hexagon-surface/60 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-hexagon-accent/10 border border-hexagon-accent/30 flex items-center justify-center text-hexagon-accent">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide flex items-center gap-2">
              Neural Networks: Lesson 1
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-hexagon-accent/10 text-hexagon-accent border border-hexagon-accent/20">
                Interactive Lecture
              </span>
            </h1>
          </div>
        </div>

        {/* Human-like Teaching Lifecycle Progression */}
        <div className="hidden lg:flex items-center gap-1 bg-background/50 border border-hexagon-border px-3 py-1.5 rounded-full">
          {phases.map((phase, idx) => {
            const isActive = idx === currentPhaseIndex;
            const isCompleted = idx < currentPhaseIndex;
            return (
              <div key={phase.id} className="flex items-center">
                <span className={`text-xs px-2.5 py-1 rounded-full transition-all font-medium ${
                  isActive 
                    ? 'bg-hexagon-accent text-black shadow-md shadow-hexagon-accent/20 font-semibold' 
                    : isCompleted 
                      ? 'text-hexagon-accent font-medium' 
                      : 'text-gray-500'
                }`}>
                  {phase.label}
                </span>
                {idx < phases.length - 1 && (
                  <span className="text-gray-600 text-xs px-0.5">›</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Language & Sound Options */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-background/50 border border-hexagon-border p-1 rounded-xl text-xs">
            {(['en', 'hi', 'kn', 'hinglish'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => updateProfile({ language: lang })}
                className={`px-2 py-1 rounded-lg uppercase font-mono font-medium transition-colors ${
                  language === lang 
                    ? 'bg-hexagon-accent text-black font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {lang === 'hi' ? 'हिन्दी' : lang === 'kn' ? 'ಕನ್ನಡ' : lang}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              voiceEnabled 
                ? 'bg-hexagon-accent/10 border-hexagon-accent/40 text-hexagon-accent' 
                : 'bg-hexagon-surface border-hexagon-border text-gray-500'
            }`}
            title={voiceEnabled ? "Mute Teacher Audio" : "Enable Teacher Voice"}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT: 3D Educator Studio Viewport */}
        <div className="w-[30%] lg:w-[35%] max-w-[420px] min-w-[320px] h-full relative border-r border-hexagon-border bg-gradient-to-b from-[#0e1217] to-[#080a0d] overflow-hidden flex flex-col">
          
          {/* Educator Status & Selector Pill */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
            <div className="flex items-center gap-2.5 bg-background/70 backdrop-blur-md border border-hexagon-border px-3.5 py-1.5 rounded-full shadow-lg">
              <div className={`w-2.5 h-2.5 rounded-full ${
                teacherState !== 'idle' && teacherState !== 'listening' 
                  ? 'bg-hexagon-accent animate-pulse' 
                  : 'bg-emerald-400'
              }`} />
              <span className="text-xs font-semibold tracking-wider">{name}</span>
              <span className="text-[10px] text-gray-400 border-l border-hexagon-border pl-2">
                {isMale ? 'Rigorous & Direct' : 'Socratic & Intuitive'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const text = 'Demonstrating real-time audio lip-sync and ActorCore gesture mapping.';
                  setTeacherState('teaching', text);
                  speakVoice(text, 3500);
                }}
                className="bg-hexagon-accent/15 border border-hexagon-accent/30 text-hexagon-accent hover:bg-hexagon-accent/25 px-3 py-1.5 rounded-full backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-medium shadow-sm hover:scale-105 active:scale-95"
                title="Test real-time Web Audio API lip-sync"
              >
                <Sparkles className="w-3.5 h-3.5" /> Test Lip-Sync
              </button>
              <button 
                onClick={() => setShowSelector(true)}
                className="bg-background/70 backdrop-blur-md border border-hexagon-border px-3 py-1.5 rounded-full hover:bg-hexagon-surface transition-colors flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white"
              >
                <UserCircle2 className="w-3.5 h-3.5" /> Change Tutor
              </button>
            </div>
          </div>

          {/* 3D Canvas Studio */}
          <div className="flex-1 w-full h-full relative">
            <Canvas 
              camera={{ position: [0, 1.62, 1.55], fov: 38 }} 
              className="w-full h-full"
              shadows
            >
              <ambientLight intensity={0.9} />
              <directionalLight position={[3, 4, 3]} intensity={1.8} color="#ffffff" castShadow />
              <directionalLight position={[-3, 2, -2]} intensity={1.2} color="#00FF9D" />
              <directionalLight position={[0, -2, -2]} intensity={0.4} color="#3b82f6" />
              <Environment preset="city" />
              
              <ProceduralAvatar 
                lookAtBoard={demoState !== 'intro'} 
                pointAtBoard={teacherState === 'pointing'} 
              />

              <ContactShadows position={[0, 0, 0]} opacity={0.65} scale={8} blur={2.2} far={3} />
              <CameraDirector viewMode={cameraMode} orbitEnabled={orbitEnabled} resetTrigger={resetTrigger} />
            </Canvas>
          </div>

          {/* Floating Camera View Toolbar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-background/85 backdrop-blur-md border border-hexagon-border p-1.5 rounded-2xl shadow-xl">
            <button
              onClick={() => setCameraMode('portrait')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                cameraMode === 'portrait' ? 'bg-hexagon-accent text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
              title="Focus Face / Portrait"
            >
              <User className="w-3.5 h-3.5" /> Face
            </button>
            <button
              onClick={() => setCameraMode('classroom')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                cameraMode === 'classroom' ? 'bg-hexagon-accent text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
              title="Upper Body / Classroom Lecture View (Recommended)"
            >
              <Eye className="w-3.5 h-3.5" /> Upper Body
            </button>
            <button
              onClick={() => setCameraMode('full')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                cameraMode === 'full' ? 'bg-hexagon-accent text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
              title="Wider View"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Torso
            </button>
            <div className="w-[1px] h-4 bg-hexagon-border mx-0.5" />
            <button
              onClick={() => {
                setCameraMode('classroom');
                setResetTrigger(p => p + 1);
              }}
              className="p-1.5 rounded-xl border border-hexagon-border bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
              title="Reset Camera Angle"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setOrbitEnabled(!orbitEnabled)}
              className={`p-1.5 rounded-xl border transition-colors ${
                orbitEnabled ? 'bg-white/5 border-hexagon-border text-gray-300' : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
              title={orbitEnabled ? "Orbit Active (Drag to rotate)" : "Orbit Locked"}
            >
              {orbitEnabled ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* RIGHT: Digital Whiteboard & Interactive Learning Console */}
        <div className="flex-1 flex flex-col p-5 gap-5 overflow-hidden">
          
          {/* Interactive Subject Board */}
          <div className="flex-1 w-full rounded-[1.75rem] overflow-hidden border border-hexagon-border bg-hexagon-surface/40 shadow-xl relative flex flex-col">
            <NeuralNetworkBoard 
              demoState={demoState}
              weightValue={weight}
              onWeightChange={handleWeightChange}
            />
          </div>

          {/* Bottom Console: Transcripts & Adaptive Chat */}
          <div className="h-36 flex gap-4 shrink-0 relative">
            
            {/* Live Synchronized Transcript Box */}
            <div className="flex-1 mr-[336px] bg-hexagon-surface/50 border border-hexagon-border rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    teacherState !== 'idle' && teacherState !== 'listening' 
                      ? 'bg-hexagon-accent/20 text-hexagon-accent' 
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {name}&apos;s Live Explanation
                  </span>
                </div>

                {/* Socratic Quick Action Chips */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => triggerChip('analogy')}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-hexagon-surface border border-hexagon-border text-gray-300 hover:text-white hover:border-hexagon-accent/50 transition-colors"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400" /> Analogy
                  </button>
                  <button 
                    onClick={() => triggerChip('simplify')}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-hexagon-surface border border-hexagon-border text-gray-300 hover:text-white hover:border-hexagon-accent/50 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-blue-400" /> Simplify
                  </button>
                  <button 
                    onClick={() => triggerChip('quiz')}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-hexagon-surface border border-hexagon-border text-gray-300 hover:text-white hover:border-hexagon-accent/50 transition-colors"
                  >
                    <HelpCircle className="w-3 h-3 text-purple-400" /> Quiz
                  </button>
                </div>
              </div>

              {/* Spoken Caption Display */}
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg font-medium text-center leading-relaxed text-hexagon-text-primary px-2">
                  {caption || "Listening to your questions and progress..."}
                </p>
              </div>
            </div>

            {/* Interactive Response Terminal Toggle Button */}
            {!isTerminalOpen && (
              <button 
                onClick={() => setIsTerminalOpen(true)}
                className="absolute bottom-2 right-2 z-30 p-3.5 rounded-full bg-hexagon-accent text-[#080a0d] shadow-lg shadow-hexagon-accent/20 hover:scale-105 active:scale-95 transition-transform"
                title="Open Student Terminal"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            )}

            {/* Interactive Response Terminal (Floating Widget) */}
            <AnimatePresence>
              {isTerminalOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-[320px] absolute bottom-0 right-0 h-[400px] z-30 bg-[#0e1217]/85 backdrop-blur-xl border border-hexagon-border rounded-3xl p-5 flex flex-col justify-between shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-hexagon-border/60 pb-3 mb-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gray-800 text-gray-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Student Terminal
                      </span>
                    </div>
                    <button 
                      onClick={() => setIsTerminalOpen(false)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto mb-3 space-y-3 scrollbar-hide flex flex-col justify-end">
                    {messages.length === 0 ? (
                      <div className="text-xs text-gray-500 text-center py-4 flex flex-col items-center gap-1">
                        <Compass className="w-4 h-4 text-gray-600" />
                        <span>Answer or ask anything</span>
                      </div>
                    ) : (
                      messages.slice(-12).map((m, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-2xl text-[13px] max-w-[92%] leading-relaxed ${
                            m.role === 'user' 
                              ? 'bg-hexagon-accent/15 border border-hexagon-accent/30 text-hexagon-text-primary ml-auto rounded-tr-sm' 
                              : 'bg-hexagon-surface border border-hexagon-border text-gray-300 mr-auto rounded-tl-sm'
                          }`}
                        >
                          {m.text}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input field */}
                  <div className="relative shrink-0 mt-1">
                    <input 
                      type="text" 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      placeholder="Type your message..."
                      className="w-full bg-hexagon-surface/80 border border-hexagon-border py-3 pl-4 pr-10 rounded-xl text-sm outline-none focus:border-hexagon-accent transition-colors shadow-inner"
                    />
                    <button 
                      onClick={handleSend}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-hexagon-accent hover:bg-hexagon-accent/10 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* TUTOR SWITCHER MODAL */}
      <AnimatePresence>
        {showSelector && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.94, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-[#12161d] border border-hexagon-border rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold tracking-tight">Select Your AI Educator</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-hexagon-accent/10 text-hexagon-accent border border-hexagon-accent/20">
                  Ready Player Me Rigs
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-8">
                Each AI Teacher has a unique pedagogy, voice tone, and adaptive guidance methodology.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* ARIA */}
                <button 
                  onClick={() => { 
                    updateProfile({ tutorGender: 'female' }); 
                    setShowSelector(false); 
                  }}
                  className={`flex flex-col text-left p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${
                    !isMale 
                      ? 'border-hexagon-accent bg-hexagon-surface/80 shadow-lg shadow-hexagon-accent/10 ring-1 ring-hexagon-accent/30' 
                      : 'border-hexagon-border bg-hexagon-surface/40 hover:border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Socratic Model
                    </span>
                    {!isMale && <CheckCircle2 className="w-5 h-5 text-hexagon-accent" />}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">ARIA</h3>
                  <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                    Patient, thoughtful, deeply conceptual. Guides students step-by-step through first-principles analogies and intuitive visualizations.
                  </p>
                  <div className="mt-auto flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2.5 py-1 bg-background/80 rounded-md border border-white/5 text-gray-300">Intuitive</span>
                    <span className="text-[10px] px-2.5 py-1 bg-background/80 rounded-md border border-white/5 text-gray-300">Analogies</span>
                    <span className="text-[10px] px-2.5 py-1 bg-background/80 rounded-md border border-white/5 text-gray-300">Patient</span>
                  </div>
                </button>

                {/* ALEX */}
                <button 
                  onClick={() => { 
                    updateProfile({ tutorGender: 'male' }); 
                    setShowSelector(false); 
                  }}
                  className={`flex flex-col text-left p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${
                    isMale 
                      ? 'border-blue-500 bg-hexagon-surface/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30' 
                      : 'border-hexagon-border bg-hexagon-surface/40 hover:border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Analytical Model
                    </span>
                    {isMale && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">ALEX</h3>
                  <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                    Rigorous, concise, highly analytical. Focuses on technical precision, mathematical formulas, and interview-grade problem solving.
                  </p>
                  <div className="mt-auto flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2.5 py-1 bg-background/80 rounded-md border border-white/5 text-gray-300">Rigorous</span>
                    <span className="text-[10px] px-2.5 py-1 bg-background/80 rounded-md border border-white/5 text-gray-300">Mathematical</span>
                    <span className="text-[10px] px-2.5 py-1 bg-background/80 rounded-md border border-white/5 text-gray-300">Direct</span>
                  </div>
                </button>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowSelector(false)} 
                  className="px-6 py-2.5 bg-hexagon-surface border border-hexagon-border rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
