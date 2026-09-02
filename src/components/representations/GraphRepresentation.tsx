'use client';
import { motion } from 'framer-motion';

export default function GraphRepresentation() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black">
      <div className="w-2/3 h-2/3 border-l-2 border-b-2 border-white/20 relative">
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-hexagon-accent to-blue-500 rounded-full origin-left"
          initial={{ scaleX: 0, y: -20, rotate: -30 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ bottom: '20%', width: '100%', rotate: '-30deg', transformOrigin: 'bottom left' }}
        />
        <div className="absolute -bottom-6 right-0 text-white/50 font-mono text-xs">x (Time)</div>
        <div className="absolute top-0 -left-6 text-white/50 font-mono text-xs -rotate-90 origin-right">y (Energy)</div>
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="border-t border-r border-white/5"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
