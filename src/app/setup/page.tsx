"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { ChevronRight, ArrowLeft, Loader2, Sparkles, BookOpen, Brain, Clock, Volume2 } from "lucide-react";

const STEPS = [
  { id: "goal", title: "What do you want to learn?", icon: BookOpen },
  { id: "level", title: "What is your current level?", icon: Brain },
  { id: "style", title: "Choose your AI Teacher", icon: Volume2 },
  { id: "time", title: "How much time do you have?", icon: Clock }
];

export default function SetupPage() {
  const router = useRouter();
  const { isAuthenticated, profile, updateProfile } = useAuthStore();
  
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<"beginner"|"intermediate"|"advanced">("beginner");
  const [tutorGender, setTutorGender] = useState<"female"|"male">("female");
  const [time, setTime] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleComplete();
  };
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else router.push("/home");
  };

  const handleComplete = async () => {
    setIsGenerating(true);
    updateProfile({ level, tutorGender, dailyGoalMinutes: time });
    
    // Simulate cinematic planning state
    await new Promise(r => setTimeout(r, 1500));
    router.push(`/lesson/plan-generation?topic=${encodeURIComponent(goal)}`);
  };

  if (!isAuthenticated || !profile) return null;

  return (
    <div className="min-h-screen bg-hexagon-bg flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-hexagon-border bg-hexagon-surface/50 backdrop-blur-md sticky top-0 z-10">
        <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-hexagon-surface border border-hexagon-border text-hexagon-text-secondary hover:text-hexagon-text-primary hover:bg-hexagon-surface-hover transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`h-2 rounded-full transition-all duration-300 ${i <= step ? 'bg-hexagon-accent' : 'bg-hexagon-border'} ${i === step ? 'w-8' : 'w-2'}`} />
          ))}
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div key="generating" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md space-y-8">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-hexagon-accent/20 rounded-full animate-ping" />
                <div className="relative w-full h-full bg-hexagon-surface border border-hexagon-accent rounded-full flex items-center justify-center text-hexagon-accent">
                  <Sparkles className="w-10 h-10 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-hexagon-text-primary">Building your learning path...</h2>
                <p className="text-hexagon-text-secondary">Analyzing objective and personalizing teaching strategy.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-2xl space-y-8">
              
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-hexagon-accent/10 text-hexagon-accent mb-4">
                  {(() => { const Icon = STEPS[step].icon; return <Icon className="w-6 h-6" />; })()}
                </div>
                <h1 className="text-3xl font-semibold text-hexagon-text-primary">{STEPS[step].title}</h1>
              </div>

              {step === 0 && (
                <div className="space-y-6">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={goal} 
                      onChange={e => setGoal(e.target.value)}
                      placeholder="e.g. Neural Networks, Quantum Physics, French Revolution..."
                      className="w-full bg-hexagon-surface border-2 border-hexagon-border focus:border-hexagon-accent rounded-2xl px-6 py-5 text-xl text-hexagon-text-primary placeholder:text-hexagon-text-secondary/50 outline-none transition-colors shadow-lg"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter' && goal.trim()) handleNext(); }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Machine Learning", "Calculus", "World War II", "Photosynthesis"].map(s => (
                      <button key={s} onClick={() => setGoal(s)} className="px-4 py-2 rounded-xl bg-hexagon-surface border border-hexagon-border text-sm text-hexagon-text-secondary hover:text-hexagon-text-primary hover:border-hexagon-accent/50 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: "beginner", label: "Beginner", desc: "I need simple explanations and fundamentals." },
                    { id: "intermediate", label: "Intermediate", desc: "I know the basics. Teach me the details." },
                    { id: "advanced", label: "Advanced", desc: "I want deep technical implementation." }
                  ].map(l => (
                    <button key={l.id} onClick={() => setLevel(l.id as any)} className={`p-6 rounded-2xl border-2 text-left transition-all ${level === l.id ? 'bg-hexagon-accent/5 border-hexagon-accent' : 'bg-hexagon-surface border-hexagon-border hover:border-hexagon-accent/50'}`}>
                      <h3 className={`font-semibold text-lg mb-2 ${level === l.id ? 'text-hexagon-accent' : 'text-hexagon-text-primary'}`}>{l.label}</h3>
                      <p className="text-sm text-hexagon-text-secondary">{l.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "female", name: "ARIA", desc: "Patient, warm, and highly visual. Uses analogies and guides you gently.", color: "from-purple-500/20" },
                    { id: "male", name: "ALEX", desc: "Direct, rigorous, and technical. Challenges you with tough questions.", color: "from-blue-500/20" }
                  ].map(t => (
                    <button key={t.id} onClick={() => setTutorGender(t.id as any)} className={`relative overflow-hidden p-6 rounded-2xl border-2 text-left transition-all bg-hexagon-surface ${tutorGender === t.id ? 'border-hexagon-accent' : 'border-hexagon-border hover:border-hexagon-accent/50'}`}>
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${t.color} to-transparent opacity-50 rounded-bl-full`} />
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl mb-4">
                          {t.id === "female" ? "👩‍🏫" : "👨‍🏫"}
                        </div>
                        <h3 className={`font-semibold text-xl mb-2 ${tutorGender === t.id ? 'text-hexagon-accent' : 'text-hexagon-text-primary'}`}>{t.name}</h3>
                        <p className="text-sm text-hexagon-text-secondary leading-relaxed">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-8 space-y-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-hexagon-text-primary mb-2">{time} <span className="text-2xl text-hexagon-text-secondary font-normal">min</span></div>
                    <p className="text-hexagon-text-secondary">Daily learning goal</p>
                  </div>
                  <input 
                    type="range" 
                    min="5" max="120" step="5" 
                    value={time} 
                    onChange={e => setTime(parseInt(e.target.value))}
                    className="w-full accent-hexagon-accent"
                  />
                  <div className="flex justify-between text-xs text-hexagon-text-secondary font-medium uppercase tracking-wider">
                    <span>Quick Review</span>
                    <span>Deep Study</span>
                  </div>
                </div>
              )}

              <div className="pt-8 flex justify-end">
                <button 
                  onClick={handleNext}
                  disabled={step === 0 && !goal.trim()}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-hexagon-accent text-black font-semibold text-lg hover:bg-hexagon-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {step === STEPS.length - 1 ? "Generate Learning Path" : "Continue"} <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
