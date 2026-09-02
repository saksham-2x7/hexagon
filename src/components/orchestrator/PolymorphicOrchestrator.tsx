'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import WebGLRepresentation from '../representations/WebGLRepresentation';
import MockNodeRepresentation from '../representations/MockNodeRepresentation';

export default function PolymorphicOrchestrator() {
  const activeRepresentation = useAIIntentStore((state) => state.activeRepresentation);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {activeRepresentation === 'webgl' ? (
          <motion.div
            key="webgl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <WebGLRepresentation />
          </motion.div>
        ) : (
          <motion.div
            key="node"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <MockNodeRepresentation />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
