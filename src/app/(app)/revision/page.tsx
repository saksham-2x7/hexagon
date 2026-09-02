"use client";
import { motion } from 'framer-motion';
import { BookOpen, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function RevisionPage() {
  return (
    <div className="max-w-5xl mx-auto p-8 pt-12 space-y-12">
      <header>
        <h1 className="text-3xl font-semibold text-hexagon-text-primary mb-2">Targeted Revision</h1>
        <p className="text-hexagon-text-secondary">Strengthen your weak concepts before moving forward.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-semibold text-hexagon-text-primary">Critical Weaknesses</h2>
          </div>
          <div className="space-y-4">
            {[
              { name: "Gradient Descent", score: 45 },
              { name: "Convolutional Filters", score: 52 },
            ].map(c => (
              <div key={c.name} className="p-4 bg-background border border-hexagon-border rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="text-hexagon-text-primary font-medium">{c.name}</h4>
                  <p className="text-xs text-orange-400 mt-1">{c.score}% Mastery</p>
                </div>
                <button className="px-4 py-2 bg-hexagon-surface-hover text-hexagon-text-primary text-sm rounded-lg hover:border-hexagon-accent transition-colors border border-transparent">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-blue-400 mb-2">Spaced Repetition</h3>
              <p className="text-hexagon-text-secondary mb-6">You have 12 flashcards due for review today.</p>
              <Link href="/flashcards" className="bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors">
                Review Flashcards
              </Link>
            </div>
            <BookOpen className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-500/20 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
