'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-hexagon-dark text-white overflow-hidden relative flex flex-col items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(40,1fr)] opacity-[0.03] pointer-events-none">
        {[...Array(1600)].map((_, i) => <div key={i} className="border-t border-l border-white" />)}
      </div>
      
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-hexagon-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 flex flex-col items-center text-center max-w-4xl px-6"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-24 h-24 border border-hexagon-accent/50 rounded-2xl flex items-center justify-center rotate-45 mb-8 mx-auto shadow-[0_0_50px_rgba(0,255,157,0.2)]">
            <div className="w-12 h-12 border-2 border-hexagon-accent rounded-xl -rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,157,0.5)]">
              <span className="text-hexagon-accent font-bold text-xl font-mono">H</span>
            </div>
          </div>
          <h1 className="text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 drop-shadow-2xl">
            HEXAGON
          </h1>
        </motion.div>

        <h2 className="text-3xl font-medium text-white/90 mb-6 tracking-tight">
          Learning that changes shape.
        </h2>
        
        <p className="text-lg text-white/50 mb-12 max-w-2xl font-light leading-relaxed">
          The teacher doesn't just explain. It changes the environment so you can understand. A polymorphic learning interface that adapts to your cognitive state in real-time.
        </p>

        <Link href="/setup">
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0,255,157,0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-hexagon-accent text-black font-bold tracking-widest text-sm rounded-full shadow-[0_0_20px_rgba(0,255,157,0.2)] transition-all uppercase"
          >
            Start Learning
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
