'use client';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function DragDropZone({ onUpload }: { onUpload: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={twMerge(clsx(
        "flex items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all duration-300",
        isHovered ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "border-gray-700 bg-gray-900/50"
      ))}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onUpload}
    >
      <p className="text-gray-400 font-medium tracking-wide">Drop materials here</p>
    </div>
  );
}

