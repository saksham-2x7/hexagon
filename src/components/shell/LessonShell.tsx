'use client';
import { ReactNode } from 'react';
import LessonHUD from './LessonHUD';
import AITeacherPiP from '../avatar/AITeacherPiP';

export default function LessonShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans relative">
      <main className="flex-1 h-full relative z-0">
        {children}
      </main>
      
      {/* Overlay Layer */}
      <LessonHUD />
      <AITeacherPiP />
    </div>
  );
}
