"use client";

import { motion } from "framer-motion";
import { Play, Sparkles, Clock } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-12">
      {/* Header */}
      <header className="space-y-2">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-semibold tracking-tight text-hexagon-text-primary"
        >
          Good afternoon, Dev.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-hexagon-text-secondary text-lg"
        >
          Ready to continue exploring quantum mechanics?
        </motion.p>
      </header>

      {/* Main Input / Prompt */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-hexagon-accent/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-hexagon-surface border border-hexagon-border rounded-2xl p-2 flex items-center backdrop-blur-xl shadow-lg">
          <div className="pl-4 pr-3 text-hexagon-accent">
            <Sparkles className="w-6 h-6" />
          </div>
          <input 
            type="text" 
            placeholder="What do you want to learn today?" 
            className="flex-1 bg-transparent border-none outline-none py-4 text-lg text-hexagon-text-primary placeholder:text-hexagon-text-secondary/50"
          />
          <Link 
            href="/lesson/debug"
            className="px-6 py-3 bg-hexagon-accent text-black font-medium rounded-xl hover:bg-hexagon-accent/90 transition-colors flex items-center gap-2"
          >
            Start <Play className="w-4 h-4 fill-black" />
          </Link>
        </div>
      </motion.div>

      {/* Continue Learning */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-hexagon-text-primary">Continue Learning</h2>
          <Link href="/learning" className="text-sm text-hexagon-accent hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard 
            title="Quantum Superposition"
            subject="Physics"
            progress={75}
            time="45m left"
            href="/lesson/debug"
          />
          <CourseCard 
            title="Advanced TypeScript Patterns"
            subject="Computer Science"
            progress={32}
            time="1h 20m left"
            href="#"
          />
          <CourseCard 
            title="Cellular Automata"
            subject="Mathematics"
            progress={12}
            time="2h 10m left"
            href="#"
          />
        </div>
      </motion.div>
    </div>
  );
}

function CourseCard({ title, subject, progress, time, href }: { title: string, subject: string, progress: number, time: string, href: string }) {
  return (
    <Link href={href} className="block group">
      <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 transition-all duration-300 hover:border-hexagon-accent/50 hover:bg-hexagon-surface-hover hover:-translate-y-1 shadow-sm">
        <div className="flex justify-between items-start mb-12">
          <span className="px-3 py-1 bg-hexagon-accent/10 text-hexagon-accent text-xs font-medium rounded-full">
            {subject}
          </span>
          <div className="w-8 h-8 rounded-full bg-hexagon-surface border border-hexagon-border flex items-center justify-center text-hexagon-text-secondary group-hover:bg-hexagon-accent group-hover:text-black transition-colors">
            <Play className="w-4 h-4 ml-0.5" />
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-hexagon-text-primary mb-2 line-clamp-2">
          {title}
        </h3>
        
        <div className="space-y-4">
          <div className="w-full bg-hexagon-border rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-hexagon-accent h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-hexagon-text-secondary">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {time}</span>
            <span>{progress}% Mastery</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
