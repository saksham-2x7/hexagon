'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { getRepresentation } from '../../lib/registry/RepresentationRegistry';
import { Suspense } from 'react';

export default function PolymorphicOrchestrator() {
  const activeRepresentation = useAIIntentStore((state) => state.activeRepresentation);
  const repEntry = getRepresentation(activeRepresentation);

  if (!repEntry) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white/50 font-mono text-sm">
        [REPRESENTATION_NOT_FOUND: {activeRepresentation}]
      </div>
    );
  }

  const ActiveComponent = repEntry.component;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRepresentation}
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center text-hexagon-accent font-mono animate-pulse">
              INITIALIZING {activeRepresentation.toUpperCase()}...
            </div>
          }>
            <ActiveComponent />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
