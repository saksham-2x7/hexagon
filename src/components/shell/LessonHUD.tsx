'use client';
import { Settings, Globe, ChevronLeft, Target } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useState } from 'react';
import MasteryDrawer from './MasteryDrawer';

export default function LessonHUD() {
  const mastery = 69; // Mocked for now
  const [isMasteryOpen, setIsMasteryOpen] = useState(false);
  
  const { lessonPhase } = useAIIntentStore(
    useShallow(state => ({
      lessonPhase: state.lessonPhase
    }))
  );

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-hexagon-surface/90 backdrop-blur-2xl border border-hexagon-border rounded-2xl p-4 shadow-2xl pointer-events-auto transition-all">
          
          {/* Left: Brand & Topic */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-r border-hexagon-border pr-6">
              <Link href="/" className="w-8 h-8 border border-hexagon-accent/50 rounded-lg rotate-45 flex items-center justify-center bg-background shadow-[0_0_15px_rgba(0,255,157,0.2)] hover:scale-110 transition-transform">
                <span className="text-hexagon-accent font-bold font-mono -rotate-45 text-sm">H</span>
              </Link>
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-hexagon-text-secondary hover:text-hexagon-text-primary rounded-full">
              <Globe size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="text-hexagon-text-secondary hover:text-hexagon-text-primary rounded-full">
              <Settings size={18} />
            </Button>
            <Link href="/">
              <Button variant="outline" className="ml-2 rounded-full border-hexagon-border hover:border-white/30 text-xs tracking-widest uppercase">
                <ChevronLeft size={14} className="mr-1" /> Exit
              </Button>
            </Link>
          </div>

        </div>
      </div>

      <MasteryDrawer isOpen={isMasteryOpen} onClose={() => setIsMasteryOpen(false)} />
    </>
  );
}
