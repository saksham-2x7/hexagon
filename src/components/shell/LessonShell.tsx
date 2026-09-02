'use client';
import { ReactNode } from 'react';

export default function LessonShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans">
      <div className="w-64 h-full bg-gray-900 border-r border-gray-800 flex flex-col p-4 shadow-2xl z-10 relative">
        <div className="flex-1">
          <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">AI Tutor Avatar</h2>
          <div className="w-full h-48 bg-gray-800 rounded-xl animate-pulse flex items-center justify-center border border-gray-700 shadow-inner">
            <span className="text-gray-500 text-xs">Video Feed Placeholder</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-auto opacity-50 text-center tracking-widest">
          HEXAGON KERNEL v0.1
        </div>
      </div>
      <main className="flex-1 h-full relative">
        {children}
      </main>
    </div>
  );
}

