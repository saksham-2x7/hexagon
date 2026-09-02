"use client";

import { Calendar } from "lucide-react";

export default function PlannerPage() {
  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-hexagon-text-primary">Study Planner</h1>
        <p className="text-hexagon-text-secondary text-lg">Manage your learning schedule.</p>
      </header>
      <div className="h-64 border border-hexagon-border border-dashed rounded-2xl flex flex-col items-center justify-center text-hexagon-text-secondary">
        <Calendar className="w-8 h-8 mb-4 opacity-50" />
        <p>Calendar integration and study planning coming soon.</p>
      </div>
    </div>
  );
}
