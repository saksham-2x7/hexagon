'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';
import { useAIIntentStore } from '../../store/useAIIntentStore';

export default function AITeacherPiP() {
  const [heights, setHeights] = useState([20, 40, 60, 40, 20]);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const lessonPhase = useAIIntentStore(state => state.lessonPhase);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeights((prev) => 
        prev.map(() => isMuted ? 10 : Math.random() * 80 + 20)
      );
    }, 150);
    return () => clearInterval(interval);
  }, [isMuted]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        width: isExpanded ? 400 : 288,
        height: isExpanded ? 300 : 192
      }}
      className="absolute bottom-6 right-6 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/15 bg-hexagon-surface backdrop-blur-3xl flex flex-col z-50 pointer-events-auto"
    >
      <div className="absolute top-3 right-3 flex gap-2 z-20">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsMuted(!isMuted)}
          className="w-8 h-8 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white"
          aria-label={isExpanded ? "Minimize" : "Expand"}
        >
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </motion.button>
      </div>

      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <div className="w-1.5 h-1.5 bg-hexagon-accent rounded-full animate-pulse" />
        <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">{lessonPhase}</span>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
        <AnimatePresence mode="wait">
          <motion.div
            key={lessonPhase}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md relative overflow-hidden shadow-2xl"
          >
            {/* Holographic Avatar Core */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-hexagon-accent/20"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            />
            <div className="w-12 h-12 bg-white/5 rounded-full border border-white/20 flex items-center justify-center z-10">
              <div className="w-4 h-4 bg-hexagon-accent rounded-full shadow-[0_0_15px_#00FF9D]" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Audio Waveform Indicator */}
      <div className="h-10 border-t border-white/5 flex items-center justify-center gap-1.5 px-4 bg-black/20">
        {heights.map((h, i) => (
          <motion.div
            key={i}
            className="w-1 bg-hexagon-accent rounded-full"
            animate={{ height: `${h}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
