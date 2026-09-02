'use client';
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LessonHUD from './LessonHUD';
import AITeacherPiP from '../teacher/AITeacherPiP';
import MockAIEngine from './MockAIEngine';
import QuestionPanel from '../../features/assessment/QuestionPanel';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { useShallow } from 'zustand/react/shallow';

export default function LessonShell({ children }: { children: ReactNode }) {
  const { activeQuestion } = useAIIntentStore(
    useShallow(state => ({
      activeQuestion: state.activeQuestion
    }))
  );

  return (
    <div className="w-screen h-screen bg-background overflow-hidden relative text-foreground">
      <LessonHUD />
      <div className="absolute inset-0 z-0">
        {children}
      </div>
      
      {/* Assessment Overlay */}
      <AnimatePresence>
        {activeQuestion && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="absolute left-10 top-1/2 -translate-y-1/2 z-30"
          >
            <QuestionPanel question={activeQuestion} />
          </motion.div>
        )}
      </AnimatePresence>

      <AITeacherPiP />
      <MockAIEngine />
    </div>
  );
}
