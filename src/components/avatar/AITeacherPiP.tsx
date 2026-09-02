'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AITeacherPiP() {
  const [heights, setHeights] = useState([20, 40, 60, 40, 20]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeights((prev) => prev.map(() => Math.random() * 80 + 20));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-6 right-6 w-72 h-48 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/15 bg-hexagon-surface backdrop-blur-3xl flex flex-col z-50 pointer-events-auto"
    >
      <div className="flex-1 relative flex items-center justify-center">
        {/* Placeholder for actual avatar video feed */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
        <span className="text-white/30 text-xs tracking-widest font-mono z-10">AI FEED OFFLINE</span>
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
