"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Play,
  Clock,
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  X,
  ChevronRight,
  Zap,
  Code2,
  FlaskConical,
  Sigma,
  Route,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type IconComponent = React.ComponentType<{ className?: string }>;

interface Module {
  id: string;
  title: string;
  status: "completed" | "current" | "locked";
}

interface Course {
  id: string;
  title: string;
  subject: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  timeRemaining: string;
  currentModule: string;
  modules: Module[];
  subjectColor: string;
  subjectIcon: IconComponent;
}

interface LearningPath {
  id: string;
  title: string;
  courses: number;
  estimatedHours: number;
  icon: IconComponent;
  color: string;
  description: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const COURSES: Course[] = [
  {
    id: "neural-networks",
    title: "Neural Networks",
    subject: "Computer Science",
    progress: 34,
    totalModules: 8,
    completedModules: 2,
    timeRemaining: "~3h 20m left",
    currentModule: "Module 2: Neuron Architecture",
    subjectColor: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
    subjectIcon: Zap,
    modules: [
      { id: "nn-m1", title: "Foundations of Neural Networks", status: "completed" },
      { id: "nn-m2", title: "Neuron Architecture", status: "current" },
      { id: "nn-m3", title: "Forward Propagation", status: "locked" },
      { id: "nn-m4", title: "Backpropagation", status: "locked" },
      { id: "nn-m5", title: "Optimization Algorithms", status: "locked" },
      { id: "nn-m6", title: "Regularization Techniques", status: "locked" },
      { id: "nn-m7", title: "Convolutional Layers", status: "locked" },
      { id: "nn-m8", title: "Recurrent Networks", status: "locked" },
    ],
  },
  {
    id: "quantum-physics",
    title: "Quantum Physics",
    subject: "Physics",
    progress: 72,
    totalModules: 5,
    completedModules: 3,
    timeRemaining: "~1h 10m left",
    currentModule: "Module 4: Wave-Particle Duality",
    subjectColor: "text-[#60a5fa] bg-[#60a5fa]/10 border-[#60a5fa]/20",
    subjectIcon: FlaskConical,
    modules: [
      { id: "qp-m1", title: "Introduction to Quantum Mechanics", status: "completed" },
      { id: "qp-m2", title: "Quantum States & Superposition", status: "completed" },
      { id: "qp-m3", title: "The Schrödinger Equation", status: "completed" },
      { id: "qp-m4", title: "Wave-Particle Duality", status: "current" },
      { id: "qp-m5", title: "Quantum Entanglement", status: "locked" },
    ],
  },
  {
    id: "advanced-typescript",
    title: "Advanced TypeScript",
    subject: "Programming",
    progress: 15,
    totalModules: 12,
    completedModules: 1,
    timeRemaining: "~5h 40m left",
    currentModule: "Module 2: Type Inference",
    subjectColor: "text-[#c084fc] bg-[#c084fc]/10 border-[#c084fc]/20",
    subjectIcon: Code2,
    modules: [
      { id: "ts-m1", title: "TypeScript Fundamentals", status: "completed" },
      { id: "ts-m2", title: "Advanced Type Inference", status: "current" },
      { id: "ts-m3", title: "Generics & Constraints", status: "locked" },
      { id: "ts-m4", title: "Conditional Types", status: "locked" },
      { id: "ts-m5", title: "Mapped Types", status: "locked" },
      { id: "ts-m6", title: "Template Literal Types", status: "locked" },
      { id: "ts-m7", title: "Declaration Merging", status: "locked" },
      { id: "ts-m8", title: "Module Augmentation", status: "locked" },
      { id: "ts-m9", title: "Decorators", status: "locked" },
      { id: "ts-m10", title: "Performance Patterns", status: "locked" },
      { id: "ts-m11", title: "Compiler API", status: "locked" },
      { id: "ts-m12", title: "Project Architecture", status: "locked" },
    ],
  },
  {
    id: "cellular-automata",
    title: "Cellular Automata",
    subject: "Mathematics",
    progress: 8,
    totalModules: 6,
    completedModules: 0,
    timeRemaining: "~4h 50m left",
    currentModule: "Module 1: Introduction",
    subjectColor: "text-[#fb923c] bg-[#fb923c]/10 border-[#fb923c]/20",
    subjectIcon: Sigma,
    modules: [
      { id: "ca-m1", title: "Introduction to Cellular Automata", status: "current" },
      { id: "ca-m2", title: "Conway's Game of Life", status: "locked" },
      { id: "ca-m3", title: "Elementary Automata & Rule Sets", status: "locked" },
      { id: "ca-m4", title: "2D Automata Patterns", status: "locked" },
      { id: "ca-m5", title: "Self-Organization & Emergence", status: "locked" },
      { id: "ca-m6", title: "Real-World Applications", status: "locked" },
    ],
  },
];

const LEARNING_PATHS: LearningPath[] = [
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    courses: 5,
    estimatedHours: 60,
    icon: Zap,
    color: "from-[#00FF9D]/20 to-[#00FF9D]/5",
    description:
      "Master neural networks, statistics, and deployment to become a production-ready ML engineer.",
  },
  {
    id: "fullstack-dev",
    title: "Full Stack Developer",
    courses: 7,
    estimatedHours: 80,
    icon: Code2,
    color: "from-[#c084fc]/20 to-[#c084fc]/5",
    description:
      "From TypeScript fundamentals to system design — everything you need to ship end-to-end.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressRing({
  progress,
  size = 56,
  strokeWidth = 4,
  color = "#00FF9D",
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
    </svg>
  );
}

function ModuleStatusIcon({ status }: { status: Module["status"] }) {
  if (status === "completed")
    return <CheckCircle2 className="w-4 h-4 text-[#00FF9D] shrink-0" />;
  if (status === "current")
    return (
      <div className="w-4 h-4 rounded-full border-2 border-hexagon-accent bg-hexagon-accent/20 shrink-0" />
    );
  return <Lock className="w-4 h-4 text-hexagon-text-secondary/40 shrink-0" />;
}

function getRingColor(subject: string): string {
  const map: Record<string, string> = {
    "Computer Science": "#00FF9D",
    Physics: "#60a5fa",
    Programming: "#c084fc",
    Mathematics: "#fb923c",
  };
  return map[subject] ?? "#00FF9D";
}

function getStatusLabel(progress: number): {
  label: string;
  className: string;
} {
  if (progress === 0)
    return {
      label: "Not Started",
      className: "text-hexagon-text-secondary/60 bg-white/5",
    };
  if (progress === 100)
    return { label: "Completed", className: "text-[#00FF9D] bg-[#00FF9D]/10" };
  return { label: "In Progress", className: "text-[#60a5fa] bg-[#60a5fa]/10" };
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function CourseModal({
  course,
  onClose,
}: {
  course: Course;
  onClose: () => void;
}) {
  const ringColor = getRingColor(course.subject);

  return (
    <motion.div
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <motion.div
        key="modal-panel"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative z-10 w-full max-w-lg bg-[#0f0f0f] border border-hexagon-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${ringColor}60, transparent)`,
          }}
        />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="space-y-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${course.subjectColor}`}
            >
              <course.subjectIcon className="w-3 h-3" />
              {course.subject}
            </span>
            <h2 className="text-xl font-semibold text-hexagon-text-primary mt-2">
              {course.title}
            </h2>
            <p className="text-sm text-hexagon-text-secondary">
              {course.completedModules} of {course.totalModules} modules complete
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-hexagon-text-secondary hover:text-hexagon-text-primary hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 mb-5">
          <div className="flex justify-between text-xs text-hexagon-text-secondary mb-2">
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course.progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: ringColor }}
            />
          </div>
        </div>

        {/* Module list */}
        <div className="px-6 pb-6 space-y-2 max-h-80 overflow-y-auto">
          {course.modules.map((mod, idx) => {
            const isClickable = mod.status !== "locked";

            if (isClickable) {
              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link href={`/lesson/${mod.id}`}>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                        mod.status === "current"
                          ? "border-hexagon-accent/30 bg-hexagon-accent/5 hover:bg-hexagon-accent/10"
                          : "border-hexagon-border/50 bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    >
                      <ModuleStatusIcon status={mod.status} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium leading-tight text-hexagon-text-primary">
                          Module {idx + 1}: {mod.title}
                        </span>
                      </div>
                      {mod.status === "current" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-hexagon-accent/20 text-hexagon-accent font-medium">
                          Current
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-hexagon-text-secondary/40 shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <div className="flex items-center gap-3 p-3 rounded-xl border border-transparent bg-white/[0.015] opacity-50 cursor-not-allowed">
                  <ModuleStatusIcon status={mod.status} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium leading-tight text-hexagon-text-secondary/50">
                      Module {idx + 1}: {mod.title}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="px-6 pb-6">
          <Link
            href={`/lesson/${
              course.modules.find((m) => m.status === "current")?.id ??
              course.modules[0].id
            }`}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm text-black transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ background: ringColor }}
          >
            <Play className="w-4 h-4 fill-black" />
            Continue — {course.currentModule}
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({
  course,
  index,
  onOpen,
}: {
  course: Course;
  index: number;
  onOpen: (course: Course) => void;
}) {
  const ringColor = getRingColor(course.subject);
  const { label: statusLabel, className: statusClass } = getStatusLabel(
    course.progress
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.07 }}
      whileHover={{ y: -3 }}
      onClick={() => onOpen(course)}
      className="relative group cursor-pointer bg-hexagon-surface border border-hexagon-border rounded-2xl p-5 overflow-hidden transition-colors duration-300 hover:border-hexagon-accent/30"
    >
      {/* Subtle hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at top left, ${ringColor}08, transparent 70%)`,
        }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${course.subjectColor}`}
        >
          <course.subjectIcon className="w-3 h-3" />
          {course.subject}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Title + ring row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative shrink-0">
          <ProgressRing
            progress={course.progress}
            size={56}
            strokeWidth={4}
            color={ringColor}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-hexagon-text-primary">
              {course.progress}%
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-hexagon-text-primary leading-tight mb-1 truncate">
            {course.title}
          </h3>
          <p className="text-xs text-hexagon-text-secondary">
            {course.completedModules} of {course.totalModules} modules
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${course.progress}%`, background: ringColor }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-hexagon-text-secondary">
          <Clock className="w-3.5 h-3.5" />
          {course.timeRemaining}
        </span>
        <button
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
          style={{
            color: ringColor,
            background: `${ringColor}15`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(course);
          }}
        >
          {course.progress === 0 ? "Start" : "Continue"}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Learning Path Card ───────────────────────────────────────────────────────

function LearningPathCard({
  path,
  index,
}: {
  path: LearningPath;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 + index * 0.08 }}
      whileHover={{ y: -2 }}
      className={`group relative overflow-hidden bg-gradient-to-br ${path.color} border border-hexagon-border rounded-2xl p-6 cursor-pointer hover:border-hexagon-accent/30 transition-colors duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <path.icon className="w-5 h-5 text-hexagon-text-primary" />
        </div>
        <div className="flex items-center gap-4 text-sm text-hexagon-text-secondary">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {path.courses} courses
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {path.estimatedHours}h est.
          </span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-hexagon-text-primary mb-1">
        {path.title}
      </h3>
      <p className="text-sm text-hexagon-text-secondary leading-relaxed mb-5">
        {path.description}
      </p>

      <button className="flex items-center gap-2 text-sm font-medium text-hexagon-accent hover:gap-3 transition-all duration-200">
        Explore path
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LearningPage() {
  const [activeModal, setActiveModal] = useState<Course | null>(null);
  const featuredCourse = COURSES[0];

  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-12">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-hexagon-text-primary">
            My Learning
          </h1>
          <p className="text-hexagon-text-secondary">
            {COURSES.length} active courses · Keep the momentum going.
          </p>
        </div>
        <Link
          href="/setup"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-black bg-hexagon-accent hover:bg-hexagon-accent/90 transition-all duration-200 active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          New Learning
        </Link>
      </motion.header>

      {/* ── Continue Learning featured card ────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        <h2 className="text-sm font-medium uppercase tracking-widest text-hexagon-text-secondary/60">
          Continue Learning
        </h2>

        <div
          onClick={() => setActiveModal(featuredCourse)}
          className="group relative overflow-hidden bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 cursor-pointer hover:border-hexagon-accent/40 transition-all duration-300"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00FF9D]/5 via-transparent to-transparent pointer-events-none" />
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#00FF9D]/60 via-[#00FF9D]/20 to-transparent" />

          <div className="relative flex items-center gap-6 flex-wrap">
            {/* Progress ring (large) */}
            <div className="relative shrink-0">
              <ProgressRing progress={34} size={80} strokeWidth={5} color="#00FF9D" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-hexagon-text-primary">34%</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-[#00FF9D] bg-[#00FF9D]/10 border border-[#00FF9D]/20">
                  <Zap className="w-3 h-3" />
                  Computer Science
                </span>
                <span className="text-xs text-hexagon-text-secondary/60 px-2 py-0.5 bg-white/5 rounded-full">
                  In Progress
                </span>
              </div>
              <h3 className="text-xl font-semibold text-hexagon-text-primary">
                Neural Networks — Complete Course
              </h3>
              <p className="text-sm text-hexagon-text-secondary">
                Module 2: Neuron Architecture
              </p>

              {/* Animated progress bar */}
              <div className="w-full max-w-sm h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "34%" }}
                  transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#00FF9D] rounded-full"
                />
              </div>
            </div>

            {/* Right action */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              <span className="flex items-center gap-1.5 text-sm text-hexagon-text-secondary">
                <Clock className="w-4 h-4" />
                ~45 min
              </span>
              <Link
                href="/lesson/nn-m2"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-black bg-[#00FF9D] hover:bg-[#00FF9D]/90 transition-all duration-200 active:scale-[0.97]"
              >
                <Play className="w-4 h-4 fill-black" />
                Continue
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── My Courses grid ────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-widest text-hexagon-text-secondary/60">
            My Courses
          </h2>
          <span className="text-xs text-hexagon-text-secondary/50">
            {COURSES.length} courses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COURSES.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              index={i}
              onOpen={setActiveModal}
            />
          ))}
        </div>
      </motion.section>

      {/* ── Recommended Learning Paths ─────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <Route className="w-4 h-4 text-hexagon-accent" />
          <h2 className="text-sm font-medium uppercase tracking-widest text-hexagon-text-secondary/60">
            Recommended Learning Paths
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {LEARNING_PATHS.map((path, i) => (
            <LearningPathCard key={path.id} path={path} index={i} />
          ))}
        </div>
      </motion.section>

      {/* ── Course Detail Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {activeModal && (
          <CourseModal
            course={activeModal}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
