"use client";

import { Layers } from "lucide-react";

export default function FlashcardsPage() {
  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-hexagon-text-primary">Spaced Repetition</h1>
        <p className="text-hexagon-text-secondary text-lg">Review flashcards generated from your lessons.</p>
      </header>
      <div className="h-64 border border-hexagon-border border-dashed rounded-2xl flex flex-col items-center justify-center text-hexagon-text-secondary">
        <Layers className="w-8 h-8 mb-4 opacity-50" />
        <p>Your due flashcards will appear here.</p>
      </div>
    </div>
  );
}
