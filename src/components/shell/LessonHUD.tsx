'use client';
import { Settings, Globe, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';

export default function LessonHUD() {
  const mastery = 42; // Mocked for now
  
  const { lessonPhase } = useAIIntentStore(
    useShallow(state => ({
      lessonPhase: state.lessonPhase
    }))
  );

  return (
    <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto transition-all">
        
        {/* Left: Brand & Topic */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 border-r border-white/10 pr-6">
            <Link href="/" className="w-8 h-8 border border-primary/50 rounded-lg rotate-45 flex items-center justify-center bg-background shadow-[0_0_15px_rgba(0,255,157,0.2)] hover:scale-110 transition-transform">
              <span className="text-primary font-bold font-mono -rotate-45 text-sm">H</span>
            </Link>
          </div>
          <div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="text-primary">{lessonPhase}</span> Phase
            </div>
            <h2 className="text-sm font-medium">Neural Network Weight Updates</h2>
          </div>
        </div>

        {/* Center: Progress & Mastery */}
        <div className="flex-1 max-w-md mx-8 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground uppercase tracking-widest font-mono text-[10px]">Topic Mastery</span>
            <span className="text-primary font-mono">{mastery}%</span>
          </div>
          <Progress value={mastery} className="h-1.5" />
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white rounded-full">
            <Globe size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white rounded-full">
            <Settings size={18} />
          </Button>
          <Link href="/">
            <Button variant="outline" className="ml-2 rounded-full border-white/10 hover:border-white/30 text-xs tracking-widest uppercase">
              <ChevronLeft size={14} className="mr-1" /> Exit
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
