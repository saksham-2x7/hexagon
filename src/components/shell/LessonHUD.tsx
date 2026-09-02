'use client';
import { useSemanticDispatcher } from '../../lib/api/useSemanticDispatcher';
import { AnimatePresence, motion } from 'framer-motion';

export default function LessonHUD() {
  const events = useSemanticDispatcher((state) => state.events);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between">
      
      {/* Top Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 rounded-full bg-hexagon-surface backdrop-blur-2xl border border-white/10 shadow-2xl pointer-events-auto">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            HEXAGON
          </h2>
        </div>
        
        {/* Progress/Mastery Bar */}
        <div className="w-64 flex flex-col gap-2">
          <div className="flex justify-between text-xs text-gray-400 font-medium">
            <span>MASTERY</span>
            <span className="text-hexagon-accent">72%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-hexagon-accent shadow-[0_0_10px_#00FF9D] w-[72%]"></div>
          </div>
        </div>
      </div>

      {/* Bottom-left Event Log */}
      <div className="absolute bottom-6 left-6 w-96 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 p-4 pointer-events-auto flex flex-col gap-2 max-h-64 overflow-hidden">
        <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-2">Semantic Event Log</h3>
        <div className="flex flex-col gap-2 overflow-y-auto">
          <AnimatePresence>
            {events.length === 0 && <span className="text-gray-600 text-sm font-mono italic">No events yet...</span>}
            {events.map((ev, i) => (
              <motion.div 
                key={JSON.stringify(ev) + i}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-xs font-mono text-hexagon-accent tracking-widest"
              >
                {'>'} {JSON.stringify(ev)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
    </div>
  );
}
