'use client';
import { motion } from 'framer-motion';

export default function AITeacherPiP() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-6 right-6 w-64 h-48 bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col z-50 pointer-events-auto"
    >
      <div className="flex-1 bg-gradient-to-br from-gray-800 to-black relative flex items-center justify-center">
        {/* Placeholder for actual avatar video feed */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
        <span className="text-gray-500 text-xs tracking-widest font-mono z-10">AI FEED OFFLINE</span>
      </div>
      
      {/* Audio Waveform Indicator */}
      <div className="h-10 bg-gray-900/80 border-t border-gray-800 flex items-center justify-center gap-1 px-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="w-1 bg-blue-500 rounded-full"
            animate={{
              height: ['20%', '80%', '40%', '100%', '20%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
