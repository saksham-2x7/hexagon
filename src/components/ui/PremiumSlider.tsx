'use client';
import { useState } from 'react';

export default function PremiumSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Level</label>
      <input 
        type="range" min="1" max="10" value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
      />
    </div>
  );
}

