'use client';
import { RepresentationProps } from '../../types/orchestration';
import { motion } from 'framer-motion';

export default function TextRepresentation({ context }: RepresentationProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black p-12">
      <motion.div 
        className="max-w-2xl w-full bg-hexagon-surface/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-12 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-extrabold text-white mb-6 tracking-tight">The Central Dogma</h2>
        <div className="space-y-6 text-gray-300 leading-relaxed font-light">
          <p>
            The central dogma of molecular biology is an explanation of the flow of genetic information within a biological system.
          </p>
          <div className="p-6 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-hexagon-accent flex items-center justify-between">
            <span>DNA</span>
            <span className="text-white/30">→ (Transcription) →</span>
            <span>RNA</span>
            <span className="text-white/30">→ (Translation) →</span>
            <span>Protein</span>
          </div>
          <p>
            This linear progression provides the foundational framework for understanding how cells operate and express their genetic code.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
