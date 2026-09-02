'use client';
import { motion } from 'framer-motion';

export default function DiagramRepresentation() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="relative w-96 h-96">
        <motion.div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-20 bg-hexagon-surface border border-white/10 rounded-xl flex items-center justify-center text-white/80 font-mono text-sm shadow-xl backdrop-blur-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          INPUT
        </motion.div>
        
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-hexagon-surface border-2 border-hexagon-accent rounded-full flex items-center justify-center text-hexagon-accent font-mono text-sm shadow-[0_0_30px_rgba(0,255,157,0.1)] backdrop-blur-md z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          PROCESS
        </motion.div>

        <motion.div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-20 bg-hexagon-surface border border-white/10 rounded-xl flex items-center justify-center text-white/80 font-mono text-sm shadow-xl backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          OUTPUT
        </motion.div>

        {/* Lines */}
        <div className="absolute top-20 bottom-20 left-1/2 w-px bg-gradient-to-b from-white/20 via-hexagon-accent to-white/20 -translate-x-1/2" />
      </div>
    </div>
  );
}
