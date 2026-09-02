'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="w-full min-h-screen bg-hexagon-dark text-white flex flex-col items-center justify-center relative px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[400px] font-black text-white/[0.02] font-mono select-none pointer-events-none">
        404
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 border border-hexagon-accent/50 rounded-2xl flex items-center justify-center rotate-45 mb-8 shadow-[0_0_30px_rgba(0,255,157,0.2)] bg-black">
          <div className="w-10 h-10 border-2 border-hexagon-accent rounded-xl -rotate-45 flex items-center justify-center">
            <span className="text-hexagon-accent font-bold font-mono">!</span>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-white/90">Signal Lost</h1>
        <p className="text-white/50 max-w-md mb-8 font-light">
          The requested coordinate does not exist in the current spatial mapping. Please return to a known sector.
        </p>
        
        <Link href="/">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-white/5 border border-white/10 hover:border-hexagon-accent text-white font-bold tracking-widest text-xs rounded-full transition-all uppercase"
          >
            Return to Nexus
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
