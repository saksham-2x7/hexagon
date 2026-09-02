"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  BookCheck,
  TrendingUp,
  Flame,
  ChevronRight,
  Brain,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

// ─── Types & Data ─────────────────────────────────────────────────────────────

type DateRange = "7d" | "30d" | "all";

const STAT_CARDS = [
  { label: "Total Study Time", value: "1,240", unit: "min", icon: Clock, color: "text-hexagon-accent", bg: "bg-hexagon-accent/10" },
  { label: "Lessons Completed", value: "23", unit: "", icon: BookCheck, color: "text-blue-400", bg: "bg-blue-400/10" },
  { label: "Avg Quiz Score", value: "78", unit: "%", icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-400/10" },
  { label: "Current Streak", value: "7", unit: "days", icon: Flame, color: "text-amber-400", bg: "bg-amber-400/10" },
];

const CONCEPTS = [
  { name: "Neural Networks Overview", pct: 88, status: "Mastered" },
  { name: "Activation Functions", pct: 82, status: "Strong" },
  { name: "Loss Functions", pct: 75, status: "Strong" },
  { name: "Forward Propagation", pct: 65, status: "Learning" },
  { name: "Backpropagation", pct: 42, status: "Needs Work" },
  { name: "Gradient Descent", pct: 38, status: "Needs Work" },
  { name: "Optimization Methods", pct: 25, status: "Starting" },
];

const STATUS_META: Record<string, { color: string; text: string }> = {
  Mastered:    { color: "bg-hexagon-accent/20 text-hexagon-accent", text: "Mastered" },
  Strong:      { color: "bg-blue-500/20 text-blue-400", text: "Strong" },
  Learning:    { color: "bg-violet-500/20 text-violet-400", text: "Learning" },
  "Needs Work":{ color: "bg-amber-500/20 text-amber-400", text: "Needs Work" },
  Starting:    { color: "bg-red-500/20 text-red-400", text: "Starting" },
};

const BAR_COLOR: Record<string, string> = {
  Mastered: "bg-hexagon-accent",
  Strong: "bg-blue-400",
  Learning: "bg-violet-400",
  "Needs Work": "bg-amber-400",
  Starting: "bg-red-400",
};

const DAILY_ACTIVITY = [
  { day: "Mon", min: 25 },
  { day: "Tue", min: 45 },
  { day: "Wed", min: 15 },
  { day: "Thu", min: 60 },
  { day: "Fri", min: 30 },
  { day: "Sat", min: 0 },
  { day: "Sun", min: 20 },
];

const RECENT_SESSIONS = [
  { date: "Sep 01", topic: "Backpropagation Deep Dive", duration: "45 min", score: 72 },
  { date: "Aug 31", topic: "Loss Functions Overview", duration: "30 min", score: 88 },
  { date: "Aug 30", topic: "Activation Functions Quiz", duration: "20 min", score: 91 },
  { date: "Aug 29", topic: "Forward Propagation Practice", duration: "35 min", score: 65 },
  { date: "Aug 28", topic: "Neural Network Foundations", duration: "55 min", score: 78 },
];

const RECOMMENDATIONS = [
  { icon: Brain, title: "Strengthen Backpropagation", desc: "Your score is 42%. Review chain rule derivations with 3 targeted exercises.", tag: "Priority" },
  { icon: TrendingUp, title: "Practice Gradient Descent", desc: "Visualizing the loss surface will improve your conceptual understanding.", tag: "Suggested" },
  { icon: Lightbulb, title: "Review Optimization Methods", desc: "Starting from 25% — try the interactive Adam optimizer simulation.", tag: "Suggested" },
];

// ─── Circular Progress Ring ───────────────────────────────────────────────────

function CircularRing({ pct }: { pct: number }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
      <svg width={180} height={180} className="-rotate-90">
        <circle cx={90} cy={90} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
        <motion.circle
          cx={90} cy={90} r={r}
          fill="none"
          stroke="var(--hexagon-accent, #00FF9D)"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-hexagon-text-primary">{pct}%</span>
        <span className="text-xs text-hexagon-text-secondary mt-1">Overall Mastery</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const [range, setRange] = useState<DateRange>("7d");

  const maxMin = Math.max(...DAILY_ACTIVITY.map(d => d.min));

  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-hexagon-text-primary">Progress</h1>
          <p className="text-hexagon-text-secondary mt-1 text-sm">Track your learning journey and identify growth areas.</p>
        </div>
        {/* Date range selector */}
        <div className="flex items-center gap-1 p-1 bg-hexagon-surface border border-hexagon-border rounded-xl">
          {(["7d", "30d", "all"] as DateRange[]).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${range === r ? "bg-hexagon-accent text-black" : "text-hexagon-text-secondary hover:text-hexagon-text-primary"}`}>
              {r === "7d" ? "Last 7 days" : r === "30d" ? "Last 30 days" : "All time"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.05 }}
            className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-5 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-hexagon-text-primary">
                {s.value}<span className="text-sm font-normal text-hexagon-text-secondary ml-1">{s.unit}</span>
              </p>
              <p className="text-xs text-hexagon-text-secondary mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Mastery + Concepts Row */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circular Ring */}
        <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 flex flex-col items-center gap-5">
          <CircularRing pct={61} />
          <div className="w-full space-y-3 text-sm">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-hexagon-accent/5 border border-hexagon-accent/20">
              <span className="text-hexagon-accent mt-0.5">✦</span>
              <div>
                <p className="text-hexagon-text-secondary text-xs font-medium mb-0.5">Strong in</p>
                <p className="text-hexagon-text-primary text-xs">Activation Functions, Loss Functions</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-hexagon-text-secondary text-xs font-medium mb-0.5">Needs work</p>
                <p className="text-hexagon-text-primary text-xs">Backpropagation, Gradient Descent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Concept Mastery List */}
        <div className="lg:col-span-2 bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-hexagon-text-primary">Concept Mastery</h2>
          <div className="space-y-3.5">
            {CONCEPTS.map((c, i) => (
              <motion.div key={c.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.04 }}
                className="flex items-center gap-3 group">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-hexagon-text-primary font-medium">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-hexagon-text-secondary">{c.pct}%</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_META[c.status].color}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-hexagon-border rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${BAR_COLOR[c.status]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.06, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-hexagon-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Activity Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-hexagon-text-primary">Daily Study Activity</h2>
          <span className="text-xs text-hexagon-text-secondary">Last 7 days</span>
        </div>
        <div className="flex items-end gap-3 h-32 pt-4">
          {DAILY_ACTIVITY.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <span className={`text-[10px] font-medium ${d.min > 0 ? "text-hexagon-text-secondary" : "text-hexagon-text-secondary/30"}`}>
                {d.min > 0 ? `${d.min}m` : "–"}
              </span>
              <div className="w-full relative flex items-end" style={{ height: 80 }}>
                <motion.div
                  className={`w-full rounded-t-md ${d.min > 0 ? "bg-hexagon-accent/70" : "bg-hexagon-border"}`}
                  initial={{ height: 0 }}
                  animate={{ height: d.min > 0 ? `${(d.min / maxMin) * 100}%` : "4px" }}
                  transition={{ duration: 0.7, delay: i * 0.07, ease: "easeOut" }}
                />
              </div>
              <span className="text-[10px] text-hexagon-text-secondary">{d.day}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Sessions + Recommendations */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-hexagon-text-primary">Recent Sessions</h2>
          <div className="space-y-1">
            {RECENT_SESSIONS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-hexagon-surface-hover transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-hexagon-accent/10 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-hexagon-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-hexagon-text-primary truncate">{s.topic}</p>
                  <p className="text-[10px] text-hexagon-text-secondary">{s.date} · {s.duration}</p>
                </div>
                <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${s.score >= 80 ? "bg-hexagon-accent/10 text-hexagon-accent" : s.score >= 65 ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {s.score}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-hexagon-text-primary">AI Recommendations</h2>
          <div className="space-y-3">
            {RECOMMENDATIONS.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.07 }}
                className="flex gap-3 p-4 rounded-xl border border-hexagon-border hover:border-hexagon-accent/30 transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-hexagon-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <r.icon className="w-4 h-4 text-hexagon-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold text-hexagon-text-primary">{r.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${r.tag === "Priority" ? "bg-amber-500/15 text-amber-400" : "bg-hexagon-accent/10 text-hexagon-accent"}`}>
                      {r.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-hexagon-text-secondary leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
