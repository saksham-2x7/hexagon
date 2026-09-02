"use client";
import { motion } from 'framer-motion';
import { Target, TrendingUp, Brain, Star } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProgressPage() {
  const { profile } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-hexagon-text-primary mb-2">Learning Progress</h1>
        <p className="text-hexagon-text-secondary">Your performance analytics and mastery.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Overall Mastery", value: "78%", icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Study Streak", value: `${profile?.streakDays || 0} days`, icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Concepts Learned", value: "42", icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Assessments Passed", value: "12", icon: Target, color: "text-green-400", bg: "bg-green-500/10" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              key={stat.label} 
              className="bg-hexagon-surface border border-hexagon-border p-6 rounded-2xl flex flex-col items-start"
            >
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-hexagon-text-primary">{stat.value}</h3>
              <p className="text-hexagon-text-secondary text-sm">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-hexagon-text-primary mb-4">Strong Concepts</h2>
          <div className="space-y-4">
            {[
              { name: "Activation Functions", score: 95 },
              { name: "Backpropagation", score: 88 },
              { name: "Newton's First Law", score: 92 },
            ].map(c => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-hexagon-text-primary">{c.name}</span>
                  <span className="text-hexagon-accent">{c.score}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-1.5">
                  <div className="bg-hexagon-accent h-full rounded-full" style={{ width: `${c.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-hexagon-text-primary mb-4 flex items-center justify-between">
            Needs Review
            <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full">Action Needed</span>
          </h2>
          <div className="space-y-4">
            {[
              { name: "Gradient Descent Optimization", score: 45 },
              { name: "Convolutional Filters", score: 52 },
            ].map(c => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-hexagon-text-primary">{c.name}</span>
                  <span className="text-red-400">{c.score}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-1.5">
                  <div className="bg-red-400 h-full rounded-full" style={{ width: `${c.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// Fix missing import
import { Flame } from 'lucide-react';
