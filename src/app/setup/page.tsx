'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      router.push('/lesson/debug');
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-hexagon-dark text-white flex flex-col items-center justify-center relative px-6">
      <Link href="/" className="absolute top-8 left-8 text-white/50 hover:text-white font-mono text-sm tracking-widest flex items-center gap-2 transition-colors">
        <span className="text-hexagon-accent">←</span> RETURN
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-hexagon-surface/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 shadow-2xl"
      >
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Initialize Session</h1>
        <p className="text-white/40 text-sm mb-8">Establish connection to the polymorphic interface.</p>

        <form onSubmit={handleStart} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-white/60 tracking-widest uppercase">Target Concept</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Cellular Respiration, Quantum Entanglement"
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-hexagon-accent transition-colors font-medium placeholder:text-white/20"
              disabled={isProcessing}
            />
          </div>

          <button 
            type="submit"
            disabled={!topic.trim() || isProcessing}
            className={`w-full py-4 rounded-xl font-bold tracking-widest text-sm transition-all uppercase flex justify-center items-center ${
              !topic.trim() || isProcessing ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-hexagon-accent text-black hover:shadow-[0_0_20px_rgba(0,255,157,0.4)]'
            }`}
          >
            {isProcessing ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/20 border-t-hexagon-accent rounded-full"
              />
            ) : (
              'Synthesize Interface'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
