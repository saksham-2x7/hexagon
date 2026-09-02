"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Flame,
  BookOpen,
  Plus,
  ChevronRight,
  RotateCcw,
  X,
  CheckCircle2,
  Trophy,
  ArrowLeft,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Rating = "again" | "hard" | "good" | "easy";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

interface Deck {
  id: number;
  name: string;
  totalCards: number;
  dueCards: number;
  mastery: number;
  icon: string;
}

interface SessionResult {
  total: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
}

type AppView = "decks" | "study" | "complete";

// ─── Data ─────────────────────────────────────────────────────────────────────

const DECKS: Deck[] = [
  { id: 1, name: "Neural Networks Basics", totalCards: 24, dueCards: 8, mastery: 75, icon: "🧠" },
  { id: 2, name: "Activation Functions", totalCards: 12, dueCards: 3, mastery: 88, icon: "⚡" },
  { id: 3, name: "Gradient Descent", totalCards: 18, dueCards: 15, mastery: 42, icon: "📉" },
];

const ALL_CARDS: Flashcard[] = [
  {
    id: 1,
    question: "What is a neuron in a neural network?",
    answer:
      "The basic computational unit that receives inputs, applies weights and bias, then outputs an activation value through a function.",
  },
  {
    id: 2,
    question: "What does the sigmoid function output?",
    answer:
      "A value between 0 and 1, calculated as 1/(1+e^-x). Used for binary classification outputs.",
  },
  {
    id: 3,
    question: "What is backpropagation?",
    answer:
      "An algorithm that computes gradients of the loss function with respect to network weights by applying the chain rule backwards through the network.",
  },
  {
    id: 4,
    question: "What is gradient descent?",
    answer:
      "An optimization algorithm that iteratively adjusts model parameters in the direction that most decreases the loss function.",
  },
  {
    id: 5,
    question: "What is the ReLU activation function?",
    answer:
      "Rectified Linear Unit: max(0, x). Outputs the input directly if positive, else 0. Solves the vanishing gradient problem.",
  },
  {
    id: 6,
    question: "What is overfitting?",
    answer:
      "When a model learns the training data too well, including noise, resulting in poor performance on new, unseen data.",
  },
  {
    id: 7,
    question: "What is a loss function?",
    answer:
      "A function that measures the difference between the model's predictions and the actual target values. The goal of training is to minimize this.",
  },
  {
    id: 8,
    question: "What is the learning rate?",
    answer:
      "A hyperparameter that controls how much to adjust model weights with each gradient descent step.",
  },
  {
    id: 9,
    question: "What is a convolutional layer?",
    answer:
      "A layer that applies learnable filters across spatial dimensions of the input, enabling the network to detect local patterns like edges and textures.",
  },
  {
    id: 10,
    question: "What is dropout regularization?",
    answer:
      "A technique that randomly disables a fraction of neurons during training, preventing co-adaptation and reducing overfitting.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function masteryColor(mastery: number): string {
  if (mastery >= 80) return "text-emerald-400";
  if (mastery >= 60) return "text-yellow-400";
  return "text-red-400";
}

function masteryBarColor(mastery: number): string {
  if (mastery >= 80) return "bg-emerald-400";
  if (mastery >= 60) return "bg-yellow-400";
  return "bg-red-400";
}

// ─── StatBadge ────────────────────────────────────────────────────────────────

function StatBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 bg-hexagon-surface border border-hexagon-border rounded-2xl px-5 py-4">
      <div className="text-hexagon-accent">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-hexagon-text-primary leading-none">{value}</p>
        <p className="text-xs text-hexagon-text-secondary mt-1">{label}</p>
      </div>
    </div>
  );
}

// ─── DeckCard ─────────────────────────────────────────────────────────────────

function DeckCard({ deck, onStudy }: { deck: Deck; onStudy: (deck: Deck) => void }) {
  const buttonLabel = deck.mastery >= 80 ? "Review" : "Study";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 flex flex-col gap-5 hover:border-hexagon-accent/30 transition-colors duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{deck.icon}</span>
          <div>
            <h3 className="font-semibold text-hexagon-text-primary leading-tight">{deck.name}</h3>
            <p className="text-xs text-hexagon-text-secondary mt-0.5">
              {deck.totalCards} cards total
            </p>
          </div>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-hexagon-accent/10 text-hexagon-accent border border-hexagon-accent/20">
          {deck.dueCards} due
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-hexagon-text-secondary">Mastery</span>
          <span className={`text-xs font-bold ${masteryColor(deck.mastery)}`}>
            {deck.mastery}%
          </span>
        </div>
        <div className="h-1.5 bg-hexagon-border rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${deck.mastery}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className={`h-full rounded-full ${masteryBarColor(deck.mastery)}`}
          />
        </div>
      </div>

      <button
        onClick={() => onStudy(deck)}
        className="w-full py-2.5 rounded-xl bg-hexagon-accent/10 hover:bg-hexagon-accent text-hexagon-accent hover:text-black font-semibold text-sm transition-all duration-200 border border-hexagon-accent/30 hover:border-hexagon-accent flex items-center justify-center gap-2 group"
      >
        <BookOpen className="w-4 h-4" />
        {buttonLabel}
        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
      </button>
    </motion.div>
  );
}

// ─── FlipCard ─────────────────────────────────────────────────────────────────

function FlipCard({
  card,
  isFlipped,
  onFlip,
}: {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div
      className="relative w-full cursor-pointer"
      style={{ perspective: "1200px", height: "320px" }}
      onClick={!isFlipped ? onFlip : undefined}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d", width: "100%", height: "100%" }}
        className="relative"
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-hexagon-surface border border-hexagon-border rounded-3xl flex flex-col items-center justify-center p-10 select-none"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-xs font-medium uppercase tracking-widest text-hexagon-accent/70 mb-6 border border-hexagon-accent/20 px-3 py-1 rounded-full">
            Question
          </span>
          <p className="text-2xl md:text-3xl font-semibold text-hexagon-text-primary text-center leading-snug">
            {card.question}
          </p>
          <div className="mt-8 flex items-center gap-2 text-hexagon-text-secondary text-sm">
            <RotateCcw className="w-4 h-4" />
            Click to reveal answer
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-hexagon-surface border border-hexagon-accent/30 rounded-3xl flex flex-col items-center justify-center p-10 select-none"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="text-xs font-medium uppercase tracking-widest text-hexagon-accent mb-6 border border-hexagon-accent/30 px-3 py-1 rounded-full bg-hexagon-accent/10">
            Answer
          </span>
          <p className="text-lg md:text-xl text-hexagon-text-primary text-center leading-relaxed">
            {card.answer}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Rating config ────────────────────────────────────────────────────────────

const RATINGS: {
  label: string;
  value: Rating;
  color: string;
  hover: string;
  border: string;
}[] = [
  {
    label: "Again",
    value: "again",
    color: "text-red-400",
    hover: "hover:bg-red-500/20 hover:border-red-400",
    border: "border-red-500/30",
  },
  {
    label: "Hard",
    value: "hard",
    color: "text-orange-400",
    hover: "hover:bg-orange-500/20 hover:border-orange-400",
    border: "border-orange-500/30",
  },
  {
    label: "Good",
    value: "good",
    color: "text-emerald-400",
    hover: "hover:bg-emerald-500/20 hover:border-emerald-400",
    border: "border-emerald-500/30",
  },
  {
    label: "Easy",
    value: "easy",
    color: "text-blue-400",
    hover: "hover:bg-blue-500/20 hover:border-blue-400",
    border: "border-blue-500/30",
  },
];

// ─── StudyMode ────────────────────────────────────────────────────────────────

function StudyMode({
  cards,
  deckName,
  onEnd,
  onComplete,
}: {
  cards: Flashcard[];
  deckName: string;
  onEnd: () => void;
  onComplete: (result: SessionResult) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [result, setResult] = useState<SessionResult>({
    total: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  const card = cards[currentIndex];
  const progress = (currentIndex / cards.length) * 100;

  const handleFlip = useCallback(() => setIsFlipped(true), []);

  const handleRate = useCallback(
    (rating: Rating) => {
      const newResult: SessionResult = {
        ...result,
        total: result.total + 1,
        [rating]: result[rating] + 1,
      };
      setResult(newResult);

      if (currentIndex + 1 >= cards.length) {
        onComplete(newResult);
        return;
      }

      setDirection(1);
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((i) => i + 1), 100);
    },
    [currentIndex, cards.length, result, onComplete]
  );

  return (
    <div className="min-h-screen bg-hexagon-bg flex flex-col">
      {/* Top bar */}
      <div className="border-b border-hexagon-border bg-hexagon-surface/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onEnd}
            className="flex items-center gap-2 text-hexagon-text-secondary hover:text-hexagon-text-primary transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            End Session
          </button>
          <div className="w-px h-5 bg-hexagon-border" />
          <span className="text-hexagon-text-secondary text-sm font-medium">{deckName}</span>
        </div>
        <span className="text-hexagon-text-secondary text-sm">
          <span className="text-hexagon-text-primary font-semibold">{currentIndex + 1}</span>
          {" / "}
          {cards.length} cards
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-hexagon-border">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full bg-hexagon-accent"
        />
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full gap-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={card.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full"
          >
            <FlipCard card={card} isFlipped={isFlipped} onFlip={handleFlip} />
          </motion.div>
        </AnimatePresence>

        {/* Flip button (pre-reveal) */}
        <AnimatePresence>
          {!isFlipped && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={handleFlip}
              className="px-8 py-3 rounded-2xl bg-hexagon-surface border border-hexagon-border text-hexagon-text-primary font-semibold hover:border-hexagon-accent/40 hover:bg-hexagon-accent/5 transition-all duration-200 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-hexagon-accent" />
              Flip Card
            </motion.button>
          )}
        </AnimatePresence>

        {/* Rating buttons (post-flip) */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-3"
            >
              <p className="text-center text-xs text-hexagon-text-secondary uppercase tracking-widest">
                How well did you know this?
              </p>
              <div className="grid grid-cols-4 gap-3">
                {RATINGS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => handleRate(r.value)}
                    className={`py-3 rounded-xl border bg-hexagon-surface ${r.border} ${r.hover} ${r.color} font-semibold text-sm transition-all duration-200`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── SessionComplete ──────────────────────────────────────────────────────────

function SessionComplete({
  result,
  onBackToDecks,
  onContinue,
}: {
  result: SessionResult;
  totalCards: number;
  onBackToDecks: () => void;
  onContinue: () => void;
}) {
  const masteredCount = result.good + result.easy;
  const masteredPct = result.total > 0 ? Math.round((masteredCount / result.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-hexagon-bg flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-lg text-center space-y-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 mx-auto rounded-full bg-hexagon-accent/10 border border-hexagon-accent/30 flex items-center justify-center"
        >
          <Trophy className="w-10 h-10 text-hexagon-accent" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-hexagon-text-primary">Session Complete!</h2>
          <p className="text-hexagon-text-secondary">
            You reviewed{" "}
            <span className="text-hexagon-text-primary font-semibold">{result.total}</span>{" "}
            cards this session.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-hexagon-text-primary">{result.total}</p>
            <p className="text-xs text-hexagon-text-secondary mt-1">Cards Reviewed</p>
          </div>
          <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-emerald-400">{masteredPct}%</p>
            <p className="text-xs text-hexagon-text-secondary mt-1">Mastered Rate</p>
          </div>
          <div className="bg-hexagon-surface border border-red-500/20 rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-red-400">{result.again}</p>
            <p className="text-xs text-hexagon-text-secondary mt-1">Again</p>
          </div>
          <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-hexagon-accent">{masteredCount}</p>
            <p className="text-xs text-hexagon-text-secondary mt-1">Mastered</p>
          </div>
        </div>

        {/* Breakdown bar */}
        {result.total > 0 && (
          <div className="space-y-2">
            <div className="flex h-2.5 w-full rounded-full overflow-hidden gap-0.5">
              {result.again > 0 && (
                <div className="bg-red-500 rounded-full" style={{ flex: result.again }} />
              )}
              {result.hard > 0 && (
                <div className="bg-orange-400 rounded-full" style={{ flex: result.hard }} />
              )}
              {result.good > 0 && (
                <div className="bg-emerald-400 rounded-full" style={{ flex: result.good }} />
              )}
              {result.easy > 0 && (
                <div className="bg-blue-400 rounded-full" style={{ flex: result.easy }} />
              )}
            </div>
            <div className="flex justify-between text-xs text-hexagon-text-secondary">
              <span>Again · {result.again}</span>
              <span>Hard · {result.hard}</span>
              <span>Good · {result.good}</span>
              <span>Easy · {result.easy}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {result.again > 0 && (
            <button
              onClick={onContinue}
              className="w-full py-3.5 rounded-2xl bg-hexagon-accent text-black font-bold text-sm hover:bg-hexagon-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Continue with {result.again} remaining
            </button>
          )}
          <button
            onClick={onBackToDecks}
            className="w-full py-3.5 rounded-2xl bg-hexagon-surface border border-hexagon-border text-hexagon-text-primary font-semibold text-sm hover:border-hexagon-accent/30 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Decks
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FlashcardsPage() {
  const [view, setView] = useState<AppView>("decks");
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [studyDeckName, setStudyDeckName] = useState("All Due Cards");
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);

  const totalDue = DECKS.reduce((acc, d) => acc + d.dueCards, 0);
  const streak = 7;

  const startStudy = useCallback((cards: Flashcard[], deckName: string) => {
    setStudyCards(cards);
    setStudyDeckName(deckName);
    setSessionResult(null);
    setView("study");
  }, []);

  const handleDeckStudy = useCallback(
    (deck: Deck) => {
      const subset = ALL_CARDS.slice(0, Math.min(deck.dueCards, ALL_CARDS.length));
      startStudy(subset, deck.name);
    },
    [startStudy]
  );

  const handleStudyAll = useCallback(() => {
    startStudy(ALL_CARDS, "All Due Cards");
  }, [startStudy]);

  const handleSessionComplete = useCallback((result: SessionResult) => {
    setSessionResult(result);
    setView("complete");
  }, []);

  const handleContinue = useCallback(() => {
    if (!sessionResult || sessionResult.again === 0) return;
    const againCards = studyCards.slice(0, sessionResult.again);
    startStudy(againCards.length > 0 ? againCards : studyCards, studyDeckName);
  }, [sessionResult, studyCards, studyDeckName, startStudy]);

  const handleBackToDecks = useCallback(() => {
    setView("decks");
    setSessionResult(null);
    setStudyCards([]);
  }, []);

  if (view === "study") {
    return (
      <StudyMode
        cards={studyCards}
        deckName={studyDeckName}
        onEnd={handleBackToDecks}
        onComplete={handleSessionComplete}
      />
    );
  }

  if (view === "complete" && sessionResult) {
    return (
      <SessionComplete
        result={sessionResult}
        totalCards={studyCards.length}
        onBackToDecks={handleBackToDecks}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 pt-12 space-y-10">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-hexagon-accent/10 border border-hexagon-accent/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-hexagon-accent" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-hexagon-text-primary">
              Flashcards
            </h1>
          </div>
          <p className="text-hexagon-text-secondary">
            Spaced repetition review — stay sharp every day.
          </p>
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-hexagon-surface border border-hexagon-border text-hexagon-text-secondary hover:text-hexagon-text-primary hover:border-hexagon-accent/30 transition-all duration-200 text-sm font-medium self-start sm:self-auto"
          onClick={() => alert("Create Deck — coming soon!")}
        >
          <Plus className="w-4 h-4" />
          Create Deck
        </button>
      </motion.header>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <StatBadge
          icon={<BookOpen className="w-5 h-5" />}
          label="Cards due today"
          value={totalDue}
        />
        <StatBadge
          icon={<Flame className="w-5 h-5" />}
          label="Day streak"
          value={`${streak} 🔥`}
        />
        <StatBadge
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Reviewed today"
          value={0}
        />
        <StatBadge
          icon={<Trophy className="w-5 h-5" />}
          label="Total decks"
          value={DECKS.length}
        />
      </motion.div>

      {/* Study All CTA */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={handleStudyAll}
        className="w-full py-4 rounded-2xl bg-hexagon-accent text-black font-bold text-base hover:bg-hexagon-accent/90 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-hexagon-accent/20"
      >
        <BookOpen className="w-5 h-5" />
        Study All {totalDue} Due Cards
      </motion.button>

      {/* Decks grid */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-hexagon-text-secondary mb-5">
          Your Decks
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DECKS.map((deck, i) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <DeckCard deck={deck} onStudy={handleDeckStudy} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
