'use client';
import { motion } from 'framer-motion';

export default function AnimatedSelector({ options, selected, onChange }: { options: string[], selected: string, onChange: (v: string) => void }) {
  return (
    <div className="flex p-1 bg-gray-900 rounded-xl relative space-x-1">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className="relative px-4 py-2 text-sm font-medium z-10 w-full capitalize text-gray-200"
        >
          {selected === option && (
            <motion.div
              layoutId="selector-bg"
              className="absolute inset-0 bg-gray-700/50 border border-gray-600 rounded-lg shadow-inner z-[-1]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {option}
        </button>
      ))}
    </div>
  );
}

