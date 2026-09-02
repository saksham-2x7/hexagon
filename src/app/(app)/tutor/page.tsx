"use client";

import { MessageSquare } from "lucide-react";

export default function TutorPage() {
  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-8 h-full flex flex-col">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-hexagon-text-primary">AI Tutor</h1>
        <p className="text-hexagon-text-secondary text-lg">Chat with your personalized AI Teacher.</p>
      </header>
      <div className="flex-1 border border-hexagon-border rounded-2xl flex flex-col items-center justify-center text-hexagon-text-secondary bg-hexagon-surface">
        <MessageSquare className="w-8 h-8 mb-4 opacity-50" />
        <p>Tutor conversational interface goes here.</p>
      </div>
    </div>
  );
}
