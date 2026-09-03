'use client';
import { motion } from 'framer-motion';
import { useSemanticDispatcher } from '../../lib/api/useSemanticDispatcher';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';

export default function LessonHUD() {
  const events = useSemanticDispatcher((state) => state.events);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Top Navigation Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white/90">Polymorphic Kernel</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400/80 tracking-widest uppercase">System Optimal</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Semantic Telemetry Log */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-6 left-6 w-80 flex flex-col justify-end pointer-events-auto"
      >
        <div className="mb-4 flex items-center gap-2 px-1">
          <Activity className="w-3 h-3 text-gray-400" />
          <span className="text-[9px] font-mono font-semibold tracking-[0.2em] text-gray-400 uppercase">Semantic Telemetry</span>
        </div>
        
        <div className="space-y-2 flex flex-col justify-end min-h-[150px]">
          {events.length === 0 ? (
            <div className="text-[10px] font-mono text-gray-600 px-2 py-1">Awaiting semantic events...</div>
          ) : (
            events.map((evt, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                className="bg-black/40 backdrop-blur-md border border-white/5 rounded-lg p-3 text-xs shadow-lg"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[9px] text-indigo-400 tracking-wider">{evt.type}</span>
                  <span className="font-mono text-[9px] text-gray-500">Just Now</span>
                </div>
                <div className="text-gray-300 font-light truncate">
                  {evt.type === 'REPRESENTATION_CHANGED' ? `Switched to ${evt.representation}` : 
                   'target' in evt ? `Target: ${evt.target}` : 
                   'conceptId' in evt ? `Concept: ${evt.conceptId}` : 
                   'value' in evt ? `Value: ${evt.value}` : 'Action recorded'}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
