"use client";

import { BookOpen } from "lucide-react";

export default function LearningPage() {
  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-hexagon-text-primary">My Learning</h1>
        <p className="text-hexagon-text-secondary text-lg">Track your active courses and pathways.</p>
      </header>
      <div className="h-64 border border-hexagon-border border-dashed rounded-2xl flex flex-col items-center justify-center text-hexagon-text-secondary">
        <BookOpen className="w-8 h-8 mb-4 opacity-50" />
        <p>Your active learning pathways will appear here.</p>
      </div>
    </div>
  );
}
