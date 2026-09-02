"use client";

import { BarChart2 } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-hexagon-text-primary">Progress Analytics</h1>
        <p className="text-hexagon-text-secondary text-lg">Visualize your mastery and cognitive growth.</p>
      </header>
      <div className="h-64 border border-hexagon-border border-dashed rounded-2xl flex flex-col items-center justify-center text-hexagon-text-secondary">
        <BarChart2 className="w-8 h-8 mb-4 opacity-50" />
        <p>Detailed performance analytics coming soon.</p>
      </div>
    </div>
  );
}
