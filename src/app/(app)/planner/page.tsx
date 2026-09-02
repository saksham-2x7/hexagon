"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckSquare,
  Square,
  Clock,
  Play,
  Calendar,
  Target,
  ChevronDown,
  Zap,
  Settings2,
} from "lucide-react";
import Link from "next/link";

// ─── Types & Data ─────────────────────────────────────────────────────────────

interface Task {
  id: string;
  label: string;
  duration: number;
  done: boolean;
}

interface DayPlan {
  day: number;
  label: string;
  isToday: boolean;
  status: "completed" | "today" | "upcoming";
  tasks: Task[];
}

const INITIAL_PLAN: DayPlan[] = [
  {
    day: 1, label: "Today", isToday: true, status: "today",
    tasks: [
      { id: "d1t1", label: "Module 1 – Foundations", duration: 30, done: false },
      { id: "d1t2", label: "Quiz: Core Concepts", duration: 15, done: false },
    ],
  },
  {
    day: 2, label: "Day 2", isToday: false, status: "upcoming",
    tasks: [
      { id: "d2t1", label: "Module 2 – Architecture", duration: 35, done: false },
      { id: "d2t2", label: "Practice Problems", duration: 10, done: false },
    ],
  },
  {
    day: 3, label: "Day 3", isToday: false, status: "upcoming",
    tasks: [
      { id: "d3t1", label: "Module 3 – Forward Pass", duration: 40, done: false },
      { id: "d3t2", label: "Exercises", duration: 10, done: false },
    ],
  },
  {
    day: 4, label: "Day 4", isToday: false, status: "upcoming",
    tasks: [
      { id: "d4t1", label: "Review – Flashcards", duration: 30, done: false },
      { id: "d4t2", label: "Practice Quiz", duration: 20, done: false },
    ],
  },
  {
    day: 5, label: "Day 5", isToday: false, status: "upcoming",
    tasks: [
      { id: "d5t1", label: "Module 4 – Backpropagation", duration: 45, done: false },
    ],
  },
  {
    day: 6, label: "Day 6", isToday: false, status: "upcoming",
    tasks: [
      { id: "d6t1", label: "Module 5 – Optimization", duration: 35, done: false },
      { id: "d6t2", label: "Full Quiz", duration: 20, done: false },
    ],
  },
  {
    day: 7, label: "Day 7", isToday: false, status: "upcoming",
    tasks: [
      { id: "d7t1", label: "Final Review", duration: 30, done: false },
      { id: "d7t2", label: "Mock Exam", duration: 30, done: false },
    ],
  },
];

const STATUS_STYLE = {
  completed: "border-hexagon-accent/40 bg-hexagon-accent/5",
  today: "border-hexagon-accent bg-hexagon-accent/8 shadow-[0_0_20px_rgba(0,255,157,0.07)]",
  upcoming: "border-hexagon-border",
};

const DAY_LOAD_COLOR = (min: number) => {
  if (min >= 60) return "bg-hexagon-accent";
  if (min >= 40) return "bg-blue-400";
  if (min >= 20) return "bg-violet-400";
  return "bg-hexagon-text-secondary/30";
};

// ─── Week Calendar View ───────────────────────────────────────────────────────

function WeekCalendar({ plan }: { plan: DayPlan[] }) {
  const maxMin = Math.max(...plan.map(d => d.tasks.reduce((s, t) => s + t.duration, 0)));
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-hexagon-accent" />
        <h2 className="text-sm font-semibold text-hexagon-text-primary">Weekly Study Load</h2>
      </div>
      <div className="flex items-end gap-2 h-20 pt-2">
        {plan.map((d, i) => {
          const total = d.tasks.reduce((s, t) => s + t.duration, 0);
          const heightPct = maxMin > 0 ? (total / maxMin) * 100 : 0;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-hexagon-text-secondary">{total}m</span>
              <div className="w-full flex items-end" style={{ height: 52 }}>
                <motion.div
                  className={`w-full rounded-t-md ${DAY_LOAD_COLOR(total)} ${d.isToday ? "ring-1 ring-hexagon-accent ring-offset-1 ring-offset-transparent" : ""}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPct, 8)}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
                />
              </div>
              <span className={`text-[10px] font-medium ${d.isToday ? "text-hexagon-accent" : "text-hexagon-text-secondary"}`}>
                {weekDays[i]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 pt-1 border-t border-hexagon-border">
        {[{ c: "bg-hexagon-accent", l: "60+ min" }, { c: "bg-blue-400", l: "40–59 min" }, { c: "bg-violet-400", l: "20–39 min" }].map(k => (
          <div key={k.l} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-sm ${k.c}`} />
            <span className="text-[10px] text-hexagon-text-secondary">{k.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Day Card ─────────────────────────────────────────────────────────────────

function DayCard({ dayPlan, onToggle }: { dayPlan: DayPlan; onToggle: (dayIdx: number, taskId: string) => void; dayIdx: number }) {
  const total = dayPlan.tasks.reduce((s, t) => s + t.duration, 0);
  const doneCount = dayPlan.tasks.filter(t => t.done).length;
  const allDone = doneCount === dayPlan.tasks.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 space-y-4 transition-all duration-300 ${STATUS_STYLE[dayPlan.status]}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${dayPlan.isToday ? "bg-hexagon-accent text-black" : "bg-hexagon-surface border border-hexagon-border text-hexagon-text-secondary"}`}>
            {dayPlan.day}
          </div>
          <div>
            <p className={`text-sm font-semibold ${dayPlan.isToday ? "text-hexagon-accent" : "text-hexagon-text-primary"}`}>
              {dayPlan.label}
              {dayPlan.isToday && <span className="ml-2 text-[10px] font-medium bg-hexagon-accent/15 text-hexagon-accent px-1.5 py-0.5 rounded-full">TODAY</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-hexagon-text-secondary">
          <Clock className="w-3.5 h-3.5" />
          <span>{total} min</span>
          {allDone && <span className="text-hexagon-accent">✓ Done</span>}
        </div>
      </div>

      <div className="space-y-2">
        {dayPlan.tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onToggle(dayPlan.day - 1, task.id)}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-hexagon-surface-hover transition-colors group text-left"
          >
            {task.done
              ? <CheckSquare className="w-4 h-4 text-hexagon-accent shrink-0" />
              : <Square className="w-4 h-4 text-hexagon-text-secondary/40 shrink-0 group-hover:text-hexagon-text-secondary transition-colors" />
            }
            <span className={`text-xs flex-1 transition-colors ${task.done ? "line-through text-hexagon-text-secondary/50" : "text-hexagon-text-primary"}`}>
              {task.label}
            </span>
            <span className="text-[10px] text-hexagon-text-secondary">{task.duration}m</span>
          </button>
        ))}
      </div>

      {/* Progress bar */}
      {dayPlan.tasks.length > 0 && (
        <div className="space-y-1">
          <div className="w-full h-1 bg-hexagon-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-hexagon-accent rounded-full"
              animate={{ width: `${(doneCount / dayPlan.tasks.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <p className="text-[10px] text-hexagon-text-secondary">{doneCount}/{dayPlan.tasks.length} tasks complete</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlannerPage() {
  const [plan, setPlan] = useState<DayPlan[]>(INITIAL_PLAN);
  const [dailyGoal, setDailyGoal] = useState(45);
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [diffOpen, setDiffOpen] = useState(false);
  const [planGenerated] = useState(true);

  function toggleTask(dayIdx: number, taskId: string) {
    setPlan(prev =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, tasks: d.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }
          : d
      )
    );
  }

  const totalPlanMin = plan.reduce((s, d) => s + d.tasks.reduce((ts, t) => ts + t.duration, 0), 0);
  const completedTasks = plan.flatMap(d => d.tasks).filter(t => t.done).length;
  const totalTasks = plan.flatMap(d => d.tasks).length;

  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-hexagon-text-primary">Study Planner</h1>
          <p className="text-hexagon-text-secondary mt-1 text-sm">AI-generated study plan tailored to your goal.</p>
        </div>
        <Link href="/lesson/neural-networks-1"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-hexagon-accent text-black text-sm font-semibold hover:bg-hexagon-accent/90 transition-colors">
          <Play className="w-4 h-4 fill-black" /> Start Today&apos;s Session
        </Link>
      </motion.div>

      {/* Goal Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-hexagon-accent" />
          <h2 className="text-sm font-semibold text-hexagon-text-primary">Study Goal</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-hexagon-text-secondary">I want to</span>
          <span className="px-3 py-1.5 rounded-lg bg-hexagon-accent/10 text-hexagon-accent font-medium border border-hexagon-accent/20">learn</span>
          <span className="px-3 py-1.5 rounded-lg bg-hexagon-surface border border-hexagon-border text-hexagon-text-primary font-medium">Neural Networks fundamentals</span>
          <span className="text-hexagon-text-secondary">by</span>
          <span className="px-3 py-1.5 rounded-lg bg-hexagon-surface border border-hexagon-border text-hexagon-text-primary font-medium">Exam in 7 days</span>
          <span className="text-hexagon-text-secondary">practicing</span>
          <span className="px-3 py-1.5 rounded-lg bg-hexagon-surface border border-hexagon-border text-hexagon-text-primary font-medium">45 min/day</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-hexagon-border">
          <div className="flex items-center gap-4 text-xs text-hexagon-text-secondary">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{totalPlanMin} min total</span>
            <span className="flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5" />{completedTasks}/{totalTasks} tasks done</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-hexagon-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-generated plan</span>
          </div>
        </div>
      </motion.div>

      {/* Week Calendar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <WeekCalendar plan={plan} />
      </motion.div>

      {/* Quick Settings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-hexagon-accent" />
          <h2 className="text-sm font-semibold text-hexagon-text-primary">Quick Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily goal slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-hexagon-text-secondary">Daily Goal</span>
              <span className="text-sm font-semibold text-hexagon-accent">{dailyGoal} min</span>
            </div>
            <div className="relative">
              <input
                type="range" min={15} max={90} step={5} value={dailyGoal}
                onChange={e => setDailyGoal(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--hexagon-accent, #00FF9D) ${((dailyGoal - 15) / 75) * 100}%, rgba(255,255,255,0.08) ${((dailyGoal - 15) / 75) * 100}%)`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-hexagon-text-secondary">
              <span>15 min</span>
              <span>90 min</span>
            </div>
          </div>

          {/* Difficulty toggle */}
          <div className="space-y-3">
            <span className="text-xs text-hexagon-text-secondary">Difficulty</span>
            <div className="relative">
              <button onClick={() => setDiffOpen(p => !p)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-hexagon-bg border border-hexagon-border text-sm text-hexagon-text-primary hover:border-hexagon-accent/40 transition-colors">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-hexagon-accent" />
                  {difficulty}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-hexagon-text-secondary transition-transform ${diffOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {diffOpen && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute top-full mt-1.5 left-0 right-0 z-20 bg-hexagon-surface border border-hexagon-border rounded-xl shadow-xl overflow-hidden">
                    {(["Beginner", "Intermediate", "Advanced"] as const).map(d => (
                      <button key={d} onClick={() => { setDifficulty(d); setDiffOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-hexagon-accent/10 transition-colors ${difficulty === d ? "text-hexagon-accent" : "text-hexagon-text-primary"}`}>
                        {d}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plan Grid */}
      <AnimatePresence>
        {planGenerated && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-hexagon-accent" />
              <h2 className="text-sm font-semibold text-hexagon-text-primary">7-Day Neural Networks Plan</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {plan.map((d, i) => (
                <DayCard key={d.day} dayPlan={d} dayIdx={i} onToggle={toggleTask} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
