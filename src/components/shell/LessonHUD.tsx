"use client";
import { Settings, Globe, ChevronLeft, ChevronRight, Target, X, Check, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MasteryDrawer from './MasteryDrawer';
import { useRouter } from 'next/navigation';

export default function LessonHUD() {
  const router = useRouter();
  const [isMasteryOpen, setIsMasteryOpen] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  
  const { lessonPhase } = useAIIntentStore(
    useShallow(state => ({
      lessonPhase: state.lessonPhase
    }))
  );

  // Derive mock mastery from phase progression
  const phaseMap = { 'Explain': 20, 'Hypothesize': 40, 'Construct': 60, 'Observe': 80, 'Resolve': 90, 'Evaluate': 100, 'Question': 50 };
  const mastery = phaseMap[lessonPhase as keyof typeof phaseMap] || 50;

  const handleNext = () => (window as any).nextLessonStep?.();
  const handlePrev = () => (window as any).prevLessonStep?.();
  const handleEnd = () => {
    setShowEndDialog(false);
    router.push('/progress');
  };

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-hexagon-surface/90 backdrop-blur-2xl border border-hexagon-border rounded-2xl p-4 shadow-2xl pointer-events-auto transition-all">
          
          {/* Left: Brand & Topic */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-r border-hexagon-border pr-6">
              <div onClick={() => setShowEndDialog(true)} className="w-8 h-8 border border-hexagon-accent/50 rounded-lg rotate-45 flex items-center justify-center bg-background shadow-[0_0_15px_rgba(0,255,157,0.2)] hover:scale-110 transition-transform cursor-pointer">
                <span className="text-hexagon-accent font-bold font-mono -rotate-45 text-sm">H</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-hexagon-text-secondary uppercase tracking-widest mb-1 flex items-center gap-2">
                <span className="text-hexagon-accent">{lessonPhase}</span> Phase
              </div>
              <h2 className="text-sm font-medium">Neural Network Weight Updates</h2>
            </div>
          </div>

          {/* Center: Progress & Mastery */}
          <div 
            className="flex-1 max-w-md mx-8 flex flex-col gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsMasteryOpen(true)}
          >
            <div className="flex justify-between text-xs font-medium">
              <span className="text-hexagon-text-secondary uppercase tracking-widest font-mono text-[10px] flex items-center gap-1">
                <Target size={10} /> Global Mastery
              </span>
              <span className="text-hexagon-accent font-mono">{mastery}%</span>
            </div>
            <Progress value={mastery} className="h-1.5 cursor-pointer" />
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-black/40 rounded-full border border-hexagon-border p-1">
              <Button variant="ghost" size="icon" onClick={handlePrev} className="w-8 h-8 rounded-full hover:bg-hexagon-surface text-hexagon-text-secondary hover:text-hexagon-text-primary">
                <ChevronLeft size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNext} className="w-8 h-8 rounded-full hover:bg-hexagon-surface text-hexagon-text-secondary hover:text-hexagon-text-primary">
                <ChevronRight size={16} />
              </Button>
            </div>
            
            <div className="w-px h-6 bg-hexagon-border mx-1" />
            
            <Button variant="outline" onClick={() => setShowEndDialog(true)} className="rounded-full border-hexagon-border hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 text-xs tracking-widest uppercase transition-colors">
              End Session
            </Button>
          </div>

        </div>
      </div>

      <MasteryDrawer isOpen={isMasteryOpen} onClose={() => setIsMasteryOpen(false)} />

      {/* End Session Dialog */}
      <AnimatePresence>
        {showEndDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <h3 className="text-xl font-semibold text-hexagon-text-primary mb-2">End Teaching Session?</h3>
              <p className="text-sm text-hexagon-text-secondary mb-6">Your progress, interactions, and mastery levels have been automatically saved. You can resume this topic later.</p>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowEndDialog(false)} className="flex-1 border-hexagon-border hover:bg-hexagon-surface-hover">
                  Cancel
                </Button>
                <Button onClick={handleEnd} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium border-0">
                  End Session
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
