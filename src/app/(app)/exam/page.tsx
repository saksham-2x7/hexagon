"use client";
import { motion } from 'framer-motion';
import { Target, Clock, ArrowRight } from 'lucide-react';

export default function ExamPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 pt-12 flex flex-col items-center text-center space-y-8">
      <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-4">
        <Target className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-bold text-hexagon-text-primary">Exam Mode</h1>
      <p className="text-hexagon-text-secondary text-lg max-w-lg">Test your mastery under pressure. The AI will dynamically select questions targeting your weakest concepts.</p>
      
      <div className="w-full max-w-md bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 text-left space-y-6">
        <div>
          <label className="block text-sm text-hexagon-text-secondary mb-2">Select Subject</label>
          <select className="w-full bg-background border border-hexagon-border rounded-xl px-4 py-3 text-hexagon-text-primary outline-none focus:border-hexagon-accent/50">
            <option>Computer Science: Neural Networks</option>
            <option>Physics: Quantum Mechanics</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-sm text-hexagon-text-secondary mb-2">Difficulty</label>
             <select className="w-full bg-background border border-hexagon-border rounded-xl px-4 py-3 text-hexagon-text-primary outline-none focus:border-hexagon-accent/50">
               <option>Adaptive</option>
               <option>Hard</option>
               <option>Extreme</option>
             </select>
           </div>
           <div>
             <label className="block text-sm text-hexagon-text-secondary mb-2">Target Time</label>
             <select className="w-full bg-background border border-hexagon-border rounded-xl px-4 py-3 text-hexagon-text-primary outline-none focus:border-hexagon-accent/50">
               <option>15 Minutes</option>
               <option>30 Minutes</option>
               <option>60 Minutes</option>
             </select>
           </div>
        </div>

        <button className="w-full bg-red-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors">
          Begin Assessment <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
