"use client";
import { motion } from 'framer-motion';
import { BrainCircuit, Activity } from 'lucide-react';

interface NeuralNetworkBoardProps {
  demoState: string;
  weightValue: number;
  onWeightChange: (val: number) => void;
}

export function NeuralNetworkBoard({ demoState, weightValue, onWeightChange }: NeuralNetworkBoardProps) {
  const isIntro = demoState === 'intro';
  const showWeights = demoState === 'explain_weights' || demoState === 'wait_for_slider' || demoState === 'slider_moved';
  const isEvaluating = demoState === 'evaluate_answer';
  const isSuccess = demoState === 'success';

  // SVG coordinates for perfect alignment
  const nodes = {
    x1: { cx: 200, cy: 150, label: "X₁" },
    x2: { cx: 200, cy: 350, label: "X₂" },
    h1: { cx: 500, cy: 100, label: "H₁" },
    h2: { cx: 500, cy: 250, label: "H₂" },
    h3: { cx: 500, cy: 400, label: "H₃" },
    y:  { cx: 800, cy: 250, label: "Y" },
  };

  const connections = [
    { from: nodes.x1, to: nodes.h1, active: !isIntro, signal: !isIntro },
    { from: nodes.x1, to: nodes.h2, active: !isIntro, signal: !isIntro },
    { from: nodes.x1, to: nodes.h3, active: !isIntro, signal: false },
    { from: nodes.x2, to: nodes.h1, active: !isIntro, signal: false },
    { from: nodes.x2, to: nodes.h2, active: !isIntro, signal: false },
    { from: nodes.x2, to: nodes.h3, active: !isIntro, signal: !isIntro },
    { from: nodes.h1, to: nodes.y, active: isEvaluating || isSuccess, signal: isSuccess, weight: weightValue },
    { from: nodes.h2, to: nodes.y, active: isEvaluating || isSuccess, signal: isSuccess, weight: 1 },
    { from: nodes.h3, to: nodes.y, active: isEvaluating || isSuccess, signal: isSuccess, weight: 1 },
  ];

  return (
    <div className="w-full h-full bg-[#111] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#222] rounded-3xl p-8 flex flex-col shadow-lg relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1a1a1a] rounded-xl border border-[#222]">
            <BrainCircuit className="w-5 h-5 text-hexagon-accent" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">Neural Network Topology</h3>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium bg-[#1a1a1a] border border-[#222] text-gray-400 px-4 py-1.5 rounded-full">
          <Activity className="w-4 h-4" />
          Live Forward Pass
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <svg viewBox="0 0 1000 500" className="w-full h-full overflow-visible">
          {/* Layer Labels */}
          <text x={200} y={40} textAnchor="middle" className="fill-hexagon-text-secondary text-sm font-bold tracking-widest">INPUT</text>
          <text x={500} y={40} textAnchor="middle" className="fill-hexagon-text-secondary text-sm font-bold tracking-widest">HIDDEN LAYER</text>
          <text x={800} y={40} textAnchor="middle" className="fill-hexagon-text-secondary text-sm font-bold tracking-widest">OUTPUT</text>

          {/* Connections */}
          {connections.map((c, i) => (
            <g key={`conn-${i}`}>
              <line 
                x1={c.from.cx} y1={c.from.cy} 
                x2={c.to.cx} y2={c.to.cy} 
                stroke={c.active ? "#00FF9D" : "currentColor"} 
                strokeWidth={Math.max(1, (c.weight || 1) * 3)}
                className={c.active ? "opacity-60" : "text-gray-400 opacity-20"}
              />
              {c.signal && (
                <motion.circle 
                  r="6" fill="#00FF9D"
                  initial={{ cx: c.from.cx, cy: c.from.cy, opacity: 0 }}
                  animate={{ cx: c.to.cx, cy: c.to.cy, opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              )}
            </g>
          ))}

          {/* Nodes */}
          {Object.entries(nodes).map(([key, n]) => {
            const isOutput = key === 'y';
            const isActive = isIntro ? false : (isOutput ? isSuccess : true);
            const r = isOutput ? 40 : 35;
            return (
              <g key={key}>
                <motion.circle 
                  cx={n.cx} cy={n.cy} r={r}
                  className={`transition-colors duration-500 ${isActive ? 'fill-hexagon-accent' : 'fill-hexagon-surface'} stroke-hexagon-border`}
                  strokeWidth="2"
                  animate={isOutput && isSuccess ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                />
                <text 
                  x={n.cx} y={n.cy} 
                  dominantBaseline="middle" textAnchor="middle" 
                  className={`font-mono font-bold text-lg ${isActive ? 'fill-black' : 'fill-hexagon-text-primary'}`}
                >
                  {n.label}
                </text>
                {isOutput && isSuccess && (
                  <motion.text 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -60 }}
                    x={n.cx} y={n.cy} textAnchor="middle"
                    className="fill-hexagon-accent font-bold text-xl"
                  >
                    MATCH!
                  </motion.text>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* HTML Overlay for the Slider */}
        {showWeights && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="absolute top-[30%] left-[55%] bg-[#111] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-hexagon-accent p-4 rounded-2xl shadow-2xl z-20 w-64"
           >
              <div className="text-sm font-bold text-hexagon-accent mb-3">ADJUST WEIGHT (w₁)</div>
              <input 
                type="range" 
                min="0" max="2" step="0.1" 
                value={weightValue} 
                onChange={(e) => onWeightChange(parseFloat(e.target.value))}
                className="w-full accent-hexagon-accent cursor-pointer"
              />
              <div className="text-right text-sm font-mono mt-2 text-white">w₁ = {weightValue.toFixed(2)}</div>
           </motion.div>
        )}
      </div>
    </div>
  );
}
