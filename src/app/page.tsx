'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const REPRESENTATIONS = [
  '3D Simulation',
  'Concept Graph',
  'Data Plot',
  'Timeline',
  'System Diagram',
  'Structured Text'
];

export default function Home() {
  const [repIndex, setRepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRepIndex((prev) => (prev + 1) % REPRESENTATIONS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-hexagon-dark text-white overflow-y-auto relative selection:bg-hexagon-accent selection:text-black">
      
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-hexagon-accent/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <div className="w-full min-h-screen flex flex-col items-center justify-center relative pt-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="z-10 flex flex-col items-center text-center max-w-5xl w-full"
        >
          {/* Logo */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="mb-12"
          >
            <div className="w-20 h-20 border border-hexagon-accent/50 rounded-2xl flex items-center justify-center rotate-45 mb-8 mx-auto shadow-[0_0_40px_rgba(0,255,157,0.1)]">
              <div className="w-10 h-10 border-2 border-hexagon-accent rounded-lg -rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,157,0.3)] bg-hexagon-dark">
                <span className="text-hexagon-accent font-bold text-lg font-mono">H</span>
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 drop-shadow-2xl">
              HEXAGON
            </h1>
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-medium text-white/90 mb-6 tracking-tight">
            Learning that <span className="text-hexagon-accent italic">changes shape</span>.
          </h2>
          
          <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl font-light leading-relaxed">
            The teacher doesn&apos;t just explain. It changes the environment so you can understand. A polymorphic interface that adapts to your cognitive state in real-time.
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
        
        {/* Dynamic Representation Visualizer */}
        <div className="mt-32 mb-20 w-full max-w-3xl h-64 border border-white/10 bg-white/5 rounded-3xl backdrop-blur-md relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-4 left-6 text-xs font-mono text-white/30 uppercase tracking-widest">Active Workspace</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={repIndex}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="text-4xl md:text-6xl font-light text-primary/80 tracking-tight"
            >
              {REPRESENTATIONS[repIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* How it works */}
      <div className="w-full max-w-6xl mx-auto px-6 py-32 border-t border-white/5">
        <h3 className="text-3xl font-bold mb-16 text-center tracking-tight">How it works</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Bring your topic.', desc: 'Upload a syllabus, paste a topic, or state a goal. HEXAGON builds a custom curriculum.' },
            { step: '2', title: 'HEXAGON understands.', desc: 'The AI maps your current knowledge level and prepares a pedagogical strategy.' },
            { step: '3', title: 'The AI Teacher plans.', desc: 'Your lesson is broken down into specific interactive phases.' },
            { step: '4', title: 'The environment changes.', desc: 'Concepts are taught in 3D, graphs, diagrams, or text depending on what works best.' },
            { step: '5', title: 'You interact.', desc: 'You don\'t just read. You hypothesize, manipulate, and observe results in real-time.' },
            { step: '6', title: 'The teacher adapts.', desc: 'Misconceptions trigger immediate changes to the teaching representation.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-card/50 border border-white/5 rounded-2xl p-8 hover:bg-white/[0.03] transition-colors"
            >
              <div className="text-hexagon-accent font-mono text-2xl font-bold mb-4 opacity-50">0{item.step}</div>
              <h4 className="text-xl font-semibold mb-3 text-white/90">{item.title}</h4>
              <p className="text-white/50 leading-relaxed text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full py-12 border-t border-white/5 flex items-center justify-center">
        <div className="flex items-center gap-3 opacity-30">
          <div className="w-6 h-6 border border-white/50 rounded-md rotate-45 flex items-center justify-center">
            <span className="text-[10px] -rotate-45 font-mono text-white font-bold">H</span>
          </div>
          <span className="font-mono text-xs tracking-widest uppercase">Hexagon 2026</span>
        </div>
      </footer>
    </div>
  );
}
