"use client";

import { Library } from "lucide-react";

export default function LibraryPage() {
  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-hexagon-text-primary">Library</h1>
        <p className="text-hexagon-text-secondary text-lg">Explore all available concepts and courses.</p>
      </header>
      <div className="h-64 border border-hexagon-border border-dashed rounded-2xl flex flex-col items-center justify-center text-hexagon-text-secondary">
        <Library className="w-8 h-8 mb-4 opacity-50" />
        <p>Search and browse the full HEXAGON knowledge graph.</p>
      </div>
    </div>
  );
}
