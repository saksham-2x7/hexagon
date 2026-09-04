"use client";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LessonHUD from "./LessonHUD";
import AITeacherPiP from "../teacher/AITeacherPiP";
import LiveAIEngine from "./LiveAIEngine";
import QuestionPanel from "../../features/assessment/QuestionPanel";
import { useAIIntentStore } from "../../store/useAIIntentStore";
import { useShallow } from "zustand/react/shallow";

export default function LessonShell({ children }: { children: ReactNode }) {
  const { activeQuestion } = useAIIntentStore(
    useShallow(state => ({
      activeQuestion: state.activeQuestion
    }))
  );

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans relative">
      {/* Top HUD for back button, progress, status */}
      <div className="absolute top-0 left-0 w-full z-40">
        <LessonHUD />
      </div>

      <div className="flex h-full w-full pt-16">
        {/* Left Pane: Tutor & Interaction */}
        <div className="w-[380px] h-full border-r border-border bg-card/50 flex flex-col relative z-20 shrink-0 shadow-lg">
          <div className="flex-1 relative">
            <AITeacherPiP />
          </div>
          {/* Assessment Overlays inside the left pane */}
          <AnimatePresence>
            {activeQuestion && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 z-30"
              >
                <QuestionPanel question={activeQuestion} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Pane: Dynamic Representations */}
        <main className="flex-1 relative bg-background/50 z-10">
          {children}
        </main>
      </div>
      
      {/* Invisible Core Engine */}
      <LiveAIEngine />
    </div>
  );
}
