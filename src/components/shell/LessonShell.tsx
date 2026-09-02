'use client';
import { ReactNode } from 'react';
import LessonHUD from './LessonHUD';
import AITeacherPiP from '../teacher/AITeacherPiP';
import MockAIEngine from './MockAIEngine';

export default function LessonShell({ children }: { children: ReactNode }) {
  return (
    <div className="w-screen h-screen bg-background overflow-hidden relative text-foreground">
      <LessonHUD />
      <div className="absolute inset-0 z-0">
        {children}
      </div>
      <AITeacherPiP />
      <MockAIEngine />
    </div>
  );
}
