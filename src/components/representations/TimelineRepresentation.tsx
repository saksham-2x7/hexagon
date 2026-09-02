'use client';
import { RepresentationProps } from '../../types/orchestration';
import { motion } from 'framer-motion';

const events = [
  { id: 1, year: '1990', title: 'Concept', active: false },
  { id: 2, year: '2005', title: 'Prototype', active: false },
  { id: 3, year: '2026', title: 'Hexagon AI', active: true },
  { id: 4, year: '2040', title: 'Singularity', active: false },
];

export default function TimelineRepresentation({ context }: RepresentationProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative w-full max-w-4xl flex items-center justify-between px-12 z-10">
        <div className="absolute left-12 right-12 h-0.5 bg-white/10 top-1/2 -translate-y-1/2 -z-10" />
        
        {events.map((ev, i) => (
          <motion.div 
            key={ev.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex flex-col items-center gap-4 relative group"
          >
            <div className={`w-4 h-4 rounded-full border-2 ${ev.active ? 'bg-hexagon-accent border-hexagon-accent shadow-[0_0_15px_#00FF9D]' : 'bg-black border-white/30 group-hover:border-white/60'} transition-all`} />
            <div className="text-center">
              <div className={`font-mono text-sm tracking-widest ${ev.active ? 'text-hexagon-accent' : 'text-white/50'}`}>{ev.year}</div>
              <div className="font-semibold text-white/90 mt-1">{ev.title}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
