"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, RotateCcw } from 'lucide-react';

const MOCK_CARDS = [
  { id: 1, front: "What is a Neural Network?", back: "A computing system inspired by biological neural networks, consisting of interconnected nodes (neurons) that process information." },
  { id: 2, front: "What is Backpropagation?", back: "The algorithm used to calculate gradients of the loss function with respect to the network's weights, allowing the network to learn from its errors." },
  { id: 3, front: "What is an Activation Function?", back: "A mathematical function applied to a neuron's output to introduce non-linearity into the network, enabling it to learn complex patterns." },
];

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleNext = () => {
    if (currentIndex < MOCK_CARDS.length - 1) {
      setCurrentIndex(c => c + 1);
      setFlipped(false);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-3xl font-semibold mb-4 text-hexagon-text-primary">Deck Completed!</h2>
        <p className="text-hexagon-text-secondary mb-8">Great job reviewing your concepts.</p>
        <button onClick={() => { setCompleted(false); setCurrentIndex(0); setFlipped(false); }} className="bg-hexagon-accent text-black px-6 py-3 rounded-xl font-semibold hover:bg-hexagon-accent/90">
          Restart Deck
        </button>
      </div>
    );
  }

  const card = MOCK_CARDS[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-8 pt-12 flex flex-col items-center">
      <header className="w-full mb-12 text-center">
        <h1 className="text-3xl font-semibold text-hexagon-text-primary">Flashcards</h1>
        <p className="text-hexagon-text-secondary">Card {currentIndex + 1} of {MOCK_CARDS.length}</p>
      </header>

      <div 
        className="w-full max-w-2xl h-80 relative cursor-pointer perspective-1000"
        onClick={() => setFlipped(!flipped)}
      >
        <motion.div
          className="w-full h-full absolute inset-0 preserve-3d"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Front */}
          <div className="absolute inset-0 bg-hexagon-surface border border-hexagon-border rounded-3xl p-12 flex items-center justify-center backface-hidden shadow-xl">
            <h2 className="text-2xl font-semibold text-center text-hexagon-text-primary">{card.front}</h2>
          </div>
          
          {/* Back */}
          <div className="absolute inset-0 bg-hexagon-accent/10 border border-hexagon-accent/30 rounded-3xl p-12 flex items-center justify-center backface-hidden shadow-xl" style={{ transform: 'rotateY(180deg)' }}>
            <p className="text-xl text-center text-hexagon-text-primary leading-relaxed">{card.back}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-4 mt-12 opacity-100 transition-opacity">
        <button onClick={handleNext} className="bg-red-500/10 text-red-400 border border-red-500/20 px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-red-500/20">
          <X className="w-5 h-5" /> Hard
        </button>
        <button onClick={handleNext} className="bg-hexagon-surface text-hexagon-text-primary border border-hexagon-border px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-hexagon-surface-hover">
          <RotateCcw className="w-5 h-5" /> Good
        </button>
        <button onClick={handleNext} className="bg-green-500/10 text-green-400 border border-green-500/20 px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-green-500/20">
          <Check className="w-5 h-5" /> Easy
        </button>
      </div>
    </div>
  );
}
