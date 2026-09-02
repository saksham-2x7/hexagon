'use client';
import { RepresentationProps } from '../../types/orchestration';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSemanticDispatcher } from '../../lib/api/useSemanticDispatcher';

export default function ManipulationRepresentation({ context }: RepresentationProps) {
  const [positions] = useState({ a: { x: -100, y: 0 }, b: { x: 100, y: 0 } });
  const dispatch = useSemanticDispatcher(s => s.dispatchAction);

  const handleDragEnd = (id: string, info: { offset: { x: number, y: number } }) => {
    dispatch({ type: 'object_drag_completed', objectId: id, offset: { x: info.offset.x, y: info.offset.y } });
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-black/95 relative overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(40,1fr)] opacity-5 pointer-events-none">
        {[...Array(1600)].map((_, i) => <div key={i} className="border-t border-l border-white/20" />)}
      </div>
      
      <div className="absolute top-1/4 text-white/30 font-mono text-sm tracking-widest pointer-events-none">
        ASSEMBLE COMPONENTS
      </div>

      <motion.div
        drag
        dragMomentum={false}
        onDragEnd={(e, info) => handleDragEnd('comp-a', info)}
        whileHover={{ scale: 1.05, borderColor: 'rgba(0,255,157,0.5)' }}
        whileDrag={{ scale: 1.1, zIndex: 50 }}
        className="w-32 h-32 bg-hexagon-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white font-mono cursor-grab active:cursor-grabbing shadow-2xl absolute"
        style={{ x: positions.a.x, y: positions.a.y }}
      >
        A
      </motion.div>
      
      <motion.div
        drag
        dragMomentum={false}
        onDragEnd={(e, info) => handleDragEnd('comp-b', info)}
        whileHover={{ scale: 1.05, borderColor: 'rgba(0,255,157,0.5)' }}
        whileDrag={{ scale: 1.1, zIndex: 50 }}
        className="w-32 h-32 bg-hexagon-surface/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white font-mono cursor-grab active:cursor-grabbing shadow-2xl absolute"
        style={{ x: positions.b.x, y: positions.b.y }}
      >
        B
      </motion.div>
    </div>
  );
}
