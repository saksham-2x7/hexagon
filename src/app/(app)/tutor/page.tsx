"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Send,
  ChevronDown,
  BookOpen,
  Compass,
  Headphones,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "aria" | "user";
type PresenceState = "teaching" | "guiding" | "listening";
type Phase = "Exploring" | "Learning" | "Practicing";

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPICS = [
  "Neural Networks",
  "Machine Learning",
  "Deep Learning",
  "Transformers",
  "Reinforcement Learning",
  "Computer Vision",
  "Natural Language Processing",
  "Gradient Descent",
];

const PHASES: Phase[] = ["Exploring", "Learning", "Practicing"];

const MOCK_RESPONSES: string[] = [
  "That's a fascinating question! Neural networks learn by adjusting weights through **backpropagation** — essentially computing how wrong the output was and nudging each connection slightly to do better next time. It's like tuning thousands of dials simultaneously.",
  "Think of an **activation function** as a neuron's decision gate. The most popular one today is ReLU (Rectified Linear Unit), which simply outputs zero for negative inputs and the value itself for positive ones. This simple trick lets networks learn complex non-linear patterns.",
  "The concept of **layers** is key here. The first layers detect simple features (edges, colors), while deeper layers combine those into complex abstractions (faces, objects). Each layer is literally building on the intelligence of the previous one.",
  "**Overfitting** is one of the biggest challenges — when a model memorizes the training data instead of learning general patterns. We combat it with techniques like dropout (randomly disabling neurons during training) and regularization.",
  "Great insight! **Gradient descent** is the optimization algorithm that drives learning. Imagine standing in a foggy mountain range trying to reach the valley — you feel the slope beneath your feet and step downhill. That's exactly what the optimizer does in the loss landscape.",
  "The **attention mechanism** in modern transformers is revolutionary. Instead of processing tokens sequentially, every token can directly attend to every other token — letting the model understand long-range dependencies in language that older RNNs struggled with.",
];

const QUICK_ACTION_RESPONSES: Record<string, string> = {
  "Explain differently":
    "Let me try a different angle! Imagine a neural network as a **chef learning a recipe**. The ingredients are your input data, each cooking step is a layer, and the final dish is your output. Through thousands of failed meals (training), the chef learns exactly how much of each technique produces the perfect result.",
  Simplify:
    "Simply put: a neural network is a **math machine** that takes numbers in, does a lot of multiplication and addition through layers, and spits numbers out. We train it by showing it examples until it gets good at its job. That's really all there is to it at the core!",
  "Go deeper":
    "Going deeper — let's talk about **vanishing gradients**. In very deep networks, the gradient signal can shrink exponentially as it passes through layers. This is why techniques like **residual connections** (skip connections in ResNets) were a breakthrough — they provide gradient highways that bypass many layers.",
  Example:
    "Here's a real-world example: **image recognition on your phone**. When you take a photo, a convolutional neural network scans it with small filters detecting edges → textures → shapes → objects → scenes. Each of the ~50 layers adds a level of understanding. The whole process runs in milliseconds.",
  "Quiz me":
    "Quiz time! Here is your question:\n\n**A neural network has 3 layers: input (4 nodes), hidden (5 nodes), output (2 nodes). How many weight parameters does it have?**\n\nHint: parameters = connections between layers. Take your time — think about what connects to what!",
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "init-1",
    role: "aria",
    content:
      "Hello! I'm **ARIA**, your personal AI tutor. Today we're exploring **Neural Networks**. What aspect would you like to start with — the architecture, how learning works, or a real-world application?",
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "init-2",
    role: "user",
    content: "Let's start with the basics",
    timestamp: new Date(Date.now() - 90000),
  },
  {
    id: "init-3",
    role: "aria",
    content:
      "Great choice! Let's build from the ground up. A neural network is inspired by the human brain — it's made up of interconnected nodes called **neurons**, organized in **layers**. Think of it like a factory assembly line where each station (layer) transforms the data in some way before passing it forward. Shall I show you a visual representation?",
    timestamp: new Date(Date.now() - 60000),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-hexagon-accent font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

let mockResponseIndex = 0;

function getNextMockResponse(): string {
  const response = MOCK_RESPONSES[mockResponseIndex % MOCK_RESPONSES.length];
  mockResponseIndex++;
  return response;
}

// ─── AriaAvatar ───────────────────────────────────────────────────────────────

function AriaAvatar({ presence }: { presence: PresenceState }) {
  const glowColor =
    presence === "teaching"
      ? "#00FF9D"
      : presence === "guiding"
      ? "#60a5fa"
      : "#a78bfa";

  const pulseScale = presence === "listening" ? [1, 1.04, 1] : [1, 1.02, 1];

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 130,
          height: 130,
          background: `radial-gradient(circle, ${glowColor}22 0%, transparent 70%)`,
          filter: "blur(8px)",
        }}
        animate={{ scale: pulseScale, opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Rotating dashed ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 118,
          height: 118,
          border: `1px dashed ${glowColor}33`,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      {/* Solid ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 110,
          height: 110,
          border: `1px solid ${glowColor}44`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Avatar frame */}
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          width: 96,
          height: 96,
          background: "linear-gradient(145deg, #1a1a2e 0%, #0d1117 50%, #0a0a14 100%)",
          boxShadow: `0 0 0 2px ${glowColor}55, 0 0 24px ${glowColor}33`,
        }}
        animate={presence === "listening" ? { scale: pulseScale } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id={`bodyGrad-${presence}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={glowColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id={`skinGrad-${presence}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5c5a3" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#e09e78" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id={`hairGrad-${presence}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1e2e" />
              <stop offset="100%" stopColor="#2d2b55" />
            </linearGradient>
            <radialGradient id={`circuitGlow-${presence}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={glowColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="48" cy="48" r="48" fill={`url(#circuitGlow-${presence})`} />
          <g opacity="0.2" stroke={glowColor} strokeWidth="0.5">
            <line x1="8" y1="72" x2="28" y2="72" />
            <line x1="28" y1="72" x2="32" y2="68" />
            <line x1="68" y1="72" x2="88" y2="72" />
            <line x1="64" y1="68" x2="68" y2="72" />
            <circle cx="28" cy="72" r="1.5" fill={glowColor} />
            <circle cx="68" cy="72" r="1.5" fill={glowColor} />
          </g>
          <path d={`M14 96 Q22 78 48 74 Q74 78 82 96Z`} fill={`url(#bodyGrad-${presence})`} opacity="0.85" />
          <rect x="43" y="60" width="10" height="14" rx="5" fill={`url(#skinGrad-${presence})`} />
          <ellipse cx="48" cy="44" rx="18" ry="20" fill={`url(#skinGrad-${presence})`} />
          <path d="M30 40 Q28 20 48 20 Q68 20 66 40 Q62 22 48 22 Q34 22 30 40Z" fill={`url(#hairGrad-${presence})`} />
          <path d="M30 40 Q26 50 30 58 Q32 44 34 40Z" fill={`url(#hairGrad-${presence})`} />
          <path d="M66 40 Q70 50 66 58 Q64 44 62 40Z" fill={`url(#hairGrad-${presence})`} />
          <ellipse cx="41" cy="44" rx="3" ry="3.5" fill="#1a1a2e" />
          <ellipse cx="55" cy="44" rx="3" ry="3.5" fill="#1a1a2e" />
          <circle cx="42.2" cy="43" r="0.9" fill={glowColor} opacity="0.9" />
          <circle cx="56.2" cy="43" r="0.9" fill={glowColor} opacity="0.9" />
          <path d="M43 52 Q48 56 53 52" stroke="#c47a52" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M47 47 Q48 50 49 47" stroke="#c47a52" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.5" />
          <circle cx="48" cy="28" r="2" fill={glowColor} opacity="0.8" />
          <circle cx="48" cy="28" r="4" stroke={glowColor} strokeWidth="0.5" opacity="0.4" fill="none" />
        </svg>
      </motion.div>

      {/* Status dot */}
      <motion.div
        className="absolute bottom-1 right-1 rounded-full"
        style={{
          width: 14,
          height: 14,
          backgroundColor: glowColor,
          border: "2px solid #050505",
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
}

// ─── TypingIndicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div
        className="w-6 h-6 rounded-full flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #00FF9D22, #60a5fa22)",
          border: "1px solid #00FF9D44",
        }}
      />
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
        style={{
          background: "rgba(0,255,157,0.06)",
          border: "1px solid rgba(0,255,157,0.12)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 6, height: 6, backgroundColor: "#00FF9D" }}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Message components ───────────────────────────────────────────────────────

function AriaMessage({ message }: { message: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-start gap-3 max-w-[80%]"
    >
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 mt-1"
        style={{
          background: "linear-gradient(135deg, #00FF9D33, #60a5fa33)",
          border: "1px solid #00FF9D55",
          boxShadow: "0 0 8px #00FF9D22",
        }}
      />
      <div className="flex flex-col gap-1">
        <span className="text-xs text-hexagon-text-secondary font-medium tracking-wide uppercase ml-1">
          ARIA · {formatTimestamp(message.timestamp)}
        </span>
        <p className="text-hexagon-text-primary text-[15px] leading-relaxed">
          {renderMarkdown(message.content)}
        </p>
      </div>
    </motion.div>
  );
}

function UserMessage({ message }: { message: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-end gap-1 max-w-[70%] self-end"
    >
      <span className="text-xs text-hexagon-text-secondary mr-1">
        {formatTimestamp(message.timestamp)}
      </span>
      <div
        className="px-4 py-2.5 rounded-2xl rounded-tr-sm text-hexagon-text-primary text-[15px] leading-relaxed"
        style={{
          background: "rgba(0, 255, 157, 0.08)",
          border: "1px solid rgba(0, 255, 157, 0.18)",
        }}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [presence, setPresence] = useState<PresenceState>("teaching");
  const [ariaStatus, setAriaStatus] = useState("Ready to help");
  const [currentTopic, setCurrentTopic] = useState("Neural Networks");
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(1);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Session timer
  useEffect(() => {
    const id = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTopicDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const sendAriaResponse = useCallback((responseText: string) => {
    setIsThinking(true);
    setAriaStatus("Thinking...");
    setPresence("guiding");
    setTimeout(() => {
      setIsThinking(false);
      setAriaStatus("Speaking...");
      setPresence("teaching");
      setMessages((prev) => [
        ...prev,
        {
          id: `aria-${Date.now()}`,
          role: "aria",
          content: responseText,
          timestamp: new Date(),
        },
      ]);
      setTimeout(() => setAriaStatus("Ready to help"), 2000);
    }, 1500);
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isThinking) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setPresence("listening");
    setAriaStatus("Listening...");
    setCurrentPhaseIndex((prev) => Math.min(2, prev));
    sendAriaResponse(getNextMockResponse());
  }, [input, isThinking, sendAriaResponse]);

  const handleQuickAction = useCallback(
    (action: string) => {
      if (isThinking) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: action,
          timestamp: new Date(),
        },
      ]);
      setPresence("listening");
      setAriaStatus("Listening...");
      sendAriaResponse(QUICK_ACTION_RESPONSES[action] ?? getNextMockResponse());
    },
    [isThinking, sendAriaResponse]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentPhase = PHASES[currentPhaseIndex];

  const phaseColors: Record<Phase, string> = {
    Exploring: "#60a5fa",
    Learning: "#00FF9D",
    Practicing: "#a78bfa",
  };

  const presenceModes: Array<{ key: PresenceState; label: string; icon: React.ReactNode }> = [
    { key: "teaching", label: "Teaching", icon: <BookOpen className="w-3 h-3" /> },
    { key: "guiding",  label: "Guiding",  icon: <Compass  className="w-3 h-3" /> },
    { key: "listening",label: "Listening",icon: <Headphones className="w-3 h-3" /> },
  ];

  const quickActions = ["Explain differently", "Simplify", "Go deeper", "Example", "Quiz me"];
  const progressPct = Math.min(100, Math.round((messages.length / 12) * 100));

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "var(--hexagon-bg)" }}
    >
      {/* ─── TOP BAR ─── */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0 z-10"
        style={{
          borderBottom: "1px solid var(--hexagon-border)",
          background: "rgba(10,10,20,0.7)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Topic selector */}
        <div className="flex items-center gap-3" ref={dropdownRef}>
          <Sparkles className="w-4 h-4 text-hexagon-accent opacity-70" />
          <div className="relative">
            <button
              onClick={() => setTopicDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-hexagon-text-primary"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--hexagon-border)",
              }}
            >
              {currentTopic}
              <ChevronDown
                className={`w-3.5 h-3.5 text-hexagon-text-secondary transition-transform duration-200 ${
                  topicDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {topicDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-1.5 left-0 z-50 py-1 rounded-xl overflow-hidden min-w-[210px]"
                  style={{
                    background: "#0d0d1a",
                    border: "1px solid var(--hexagon-border)",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                  }}
                >
                  {TOPICS.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setCurrentTopic(topic);
                        setTopicDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors"
                      style={{
                        color:
                          topic === currentTopic
                            ? "var(--hexagon-accent)"
                            : "var(--hexagon-text-secondary)",
                        background:
                          topic === currentTopic
                            ? "rgba(0,255,157,0.08)"
                            : "transparent",
                      }}
                    >
                      {topic}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Phase + Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {PHASES.map((phase, i) => (
              <button
                key={phase}
                onClick={() => setCurrentPhaseIndex(i)}
                className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200"
                style={{
                  background:
                    currentPhase === phase ? `${phaseColors[phase]}22` : "transparent",
                  color:
                    currentPhase === phase
                      ? phaseColors[phase]
                      : "var(--hexagon-text-secondary)",
                  border: `1px solid ${
                    currentPhase === phase ? `${phaseColors[phase]}55` : "transparent"
                  }`,
                }}
              >
                {phase}
              </button>
            ))}
          </div>

          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-hexagon-text-secondary"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--hexagon-border)",
            }}
          >
            <Clock className="w-3 h-3" />
            {formatTime(sessionSeconds)}
          </div>
        </div>
      </div>

      {/* ─── BODY ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT PANEL ─── */}
        <div
          className="w-64 flex-shrink-0 flex flex-col items-center py-8 px-5 gap-6 overflow-y-auto"
          style={{
            borderRight: "1px solid var(--hexagon-border)",
            background: "rgba(8,8,16,0.5)",
          }}
        >
          <AriaAvatar presence={presence} />

          {/* Name & status */}
          <div className="flex flex-col items-center gap-1.5">
            <h2 className="text-hexagon-text-primary font-bold text-lg tracking-widest">
              ARIA
            </h2>
            <motion.div
              key={ariaStatus}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5"
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    ariaStatus === "Thinking..."
                      ? "#facc15"
                      : ariaStatus === "Speaking..."
                      ? "#00FF9D"
                      : ariaStatus === "Listening..."
                      ? "#a78bfa"
                      : "#4ade80",
                }}
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-xs text-hexagon-text-secondary">{ariaStatus}</span>
            </motion.div>
          </div>

          <div className="w-full" style={{ borderTop: "1px solid var(--hexagon-border)" }} />

          {/* Presence selector */}
          <div className="w-full flex flex-col gap-1.5">
            <p className="text-[10px] text-hexagon-text-secondary uppercase tracking-widest font-semibold mb-1 px-1">
              Mode
            </p>
            {presenceModes.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setPresence(key)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200"
                style={{
                  background: presence === key ? "rgba(0,255,157,0.08)" : "transparent",
                  color:
                    presence === key
                      ? "var(--hexagon-accent)"
                      : "var(--hexagon-text-secondary)",
                  border: `1px solid ${
                    presence === key ? "rgba(0,255,157,0.2)" : "transparent"
                  }`,
                }}
              >
                {icon}
                {label}
                {presence === key && (
                  <motion.div
                    layoutId="presence-pip"
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "var(--hexagon-accent)" }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="w-full" style={{ borderTop: "1px solid var(--hexagon-border)" }} />

          {/* Session stats */}
          <div className="w-full flex flex-col gap-3">
            <p className="text-[10px] text-hexagon-text-secondary uppercase tracking-widest font-semibold px-1">
              Session
            </p>
            {[
              { label: "Messages", value: messages.length },
              { label: "Topic",    value: currentTopic.split(" ")[0] },
              { label: "Phase",    value: currentPhase },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-1">
                <span className="text-xs text-hexagon-text-secondary">{label}</span>
                <span className="text-xs font-medium text-hexagon-text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CHAT AREA ─── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
            {messages.map((msg) =>
              msg.role === "aria" ? (
                <AriaMessage key={msg.id} message={msg} />
              ) : (
                <UserMessage key={msg.id} message={msg} />
              )
            )}

            <AnimatePresence>
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Quick action chips */}
          <div
            className="px-8 py-3 flex items-center gap-2 flex-wrap flex-shrink-0"
            style={{ borderTop: "1px solid var(--hexagon-border)" }}
          >
            <Zap className="w-3.5 h-3.5 text-hexagon-accent opacity-60 flex-shrink-0" />
            {quickActions.map((action) => (
              <motion.button
                key={action}
                onClick={() => handleQuickAction(action)}
                disabled={isThinking}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(0,255,157,0.06)",
                  border: "1px solid rgba(0,255,157,0.2)",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {action}
              </motion.button>
            ))}
          </div>

          {/* Input bar */}
          <div
            className="px-8 py-4 flex items-center gap-3 flex-shrink-0"
            style={{ borderTop: "1px solid var(--hexagon-border)" }}
          >
            {/* Mic */}
            <motion.button
              onClick={() => setIsRecording((r) => !r)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              className="relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: isRecording ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${isRecording ? "rgba(239,68,68,0.5)" : "var(--hexagon-border)"}`,
              }}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 text-red-400" />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: "1px solid rgba(239,68,68,0.6)" }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                </>
              ) : (
                <Mic className="w-4 h-4 text-hexagon-text-secondary" />
              )}
            </motion.button>

            {/* Text input */}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask ARIA anything..."
              disabled={isThinking}
              className="flex-1 bg-transparent text-hexagon-text-primary placeholder:text-hexagon-text-secondary text-sm outline-none px-4 py-2.5 rounded-xl disabled:opacity-50"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--hexagon-border)",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,255,157,0.35)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,255,157,0.06)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--hexagon-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            {/* Send */}
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              whileHover={{ scale: input.trim() ? 1.08 : 1 }}
              whileTap={{ scale: input.trim() ? 0.93 : 1 }}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: input.trim()
                  ? "linear-gradient(135deg, #00FF9D, #00cc7a)"
                  : "rgba(255,255,255,0.05)",
                boxShadow: input.trim() ? "0 0 16px rgba(0,255,157,0.35)" : "none",
              }}
            >
              <Send
                className="w-4 h-4"
                style={{ color: input.trim() ? "#000" : "var(--hexagon-text-secondary)" }}
              />
            </motion.button>
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div
          className="w-56 flex-shrink-0 flex flex-col py-6 px-4 gap-5"
          style={{
            borderLeft: "1px solid var(--hexagon-border)",
            background: "rgba(8,8,16,0.5)",
          }}
        >
          <p className="text-[10px] text-hexagon-text-secondary uppercase tracking-widest font-semibold px-1">
            Quick Actions
          </p>

          {quickActions.map((action, i) => (
            <motion.button
              key={action}
              onClick={() => handleQuickAction(action)}
              disabled={isThinking}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              whileHover={{ x: -2 }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--hexagon-border)",
                color: "var(--hexagon-text-secondary)",
              }}
            >
              {action}
            </motion.button>
          ))}

          <div style={{ borderTop: "1px solid var(--hexagon-border)" }} />

          <div className="flex flex-col gap-3">
            <p className="text-[10px] text-hexagon-text-secondary uppercase tracking-widest font-semibold px-1">
              About this topic
            </p>
            <p className="text-xs text-hexagon-text-secondary leading-relaxed px-1">
              {currentTopic} is a foundational concept in modern AI. Understanding it unlocks deeper areas of machine learning and data science.
            </p>
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-2 mt-auto">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] text-hexagon-text-secondary uppercase tracking-wide">
                Progress
              </span>
              <span className="text-[10px] text-hexagon-accent font-semibold">
                {progressPct}%
              </span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: 4, background: "rgba(255,255,255,0.07)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #00FF9D, #60a5fa)",
                  boxShadow: "0 0 8px #00FF9D66",
                }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
