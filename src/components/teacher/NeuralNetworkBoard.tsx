"use client";
import { motion } from 'framer-motion';
import { Network, BrainCircuit, Activity } from 'lucide-react';

interface NeuralNetworkBoardProps {
  demoState: string;
  weightValue: number;
  onWeightChange: (val: number) => void;
}


const Connection = ({ from, to, active, weight = 1, showSignal = false, signalColor = "#00FF9D" }: {from: string[], to: string[], active: boolean, weight?: number, showSignal?: boolean, signalColor?: string}) => {
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <motion.line 
        x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} 
        stroke={active ? "#00FF9D" : "#333"} 
        strokeWidth={Math.max(1, weight * 3)} 
        strokeOpacity={active ? 0.8 : 0.4}
      />
      {showSignal && active && (
        <motion.circle 
          r="4" fill={signalColor}
          initial={{ cx: from[0], cy: from[1], opacity: 0 }}
          animate={{ cx: to[0], cy: to[1], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}
    </svg>
  );
};

export function NeuralNetworkBoard({ demoState, weightValue, onWeightChange }: NeuralNetworkBoardProps) {
  const isIntro = demoState === 'intro';
  const showWeights = demoState === 'explain_weights' || demoState === 'wait_for_slider' || demoState === 'slider_moved';
  const isEvaluating = demoState === 'evaluate_answer';
  const isSuccess = demoState === 'success';

  // Node styles
  const activeNode = "bg-hexagon-accent shadow-[0_0_15px_rgba(0,255,157,0.5)] border-transparent";
  const inactiveNode = "bg-hexagon-surface border-hexagon-border border-2 text-hexagon-text-secondary";
  const errorNode = "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] border-transparent";



  return (
    <div className="w-full h-full bg-[#050505] rounded-[2rem] border border-hexagon-border p-8 flex flex-col relative overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-hexagon-surface rounded-xl">
            <BrainCircuit className="w-6 h-6 text-hexagon-accent" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Neural Network Topology</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-hexagon-text-secondary font-medium bg-hexagon-surface px-4 py-1.5 rounded-full">
          <Activity className="w-4 h-4" />
          Live Forward Pass
        </div>
      </div>

      {/* Network Visualization Area */}
      <div className="flex-1 relative flex items-center justify-between px-16 z-10">
        
        {/* SVG Connections (hardcoded layout percentages for demo) */}
        <div className="absolute inset-0 pointer-events-none">
          <Connection from={["15%", "30%"]} to={["50%", "20%"]} active={!isIntro} showSignal={!isIntro} />
          <Connection from={["15%", "30%"]} to={["50%", "50%"]} active={!isIntro} showSignal={!isIntro} />
          <Connection from={["15%", "30%"]} to={["50%", "80%"]} active={!isIntro} />
          
          <Connection from={["15%", "70%"]} to={["50%", "20%"]} active={!isIntro} />
          <Connection from={["15%", "70%"]} to={["50%", "50%"]} active={!isIntro} />
          <Connection from={["15%", "70%"]} to={["50%", "80%"]} active={!isIntro} showSignal={!isIntro} />

          {/* Hidden to Output connections */}
          <Connection from={["50%", "20%"]} to={["85%", "50%"]} active={isEvaluating || isSuccess} showSignal={isSuccess} weight={weightValue} />
          <Connection from={["50%", "50%"]} to={["85%", "50%"]} active={isEvaluating || isSuccess} showSignal={isSuccess} weight={1} />
          <Connection from={["50%", "80%"]} to={["85%", "50%"]} active={isEvaluating || isSuccess} showSignal={isSuccess} weight={1} />
        </div>

        {/* Input Layer */}
        <div className="flex flex-col gap-12 items-center relative z-10 w-[15%]">
          <div className="text-sm font-semibold text-hexagon-text-secondary mb-4">INPUT</div>
          <motion.div animate={{ scale: isIntro ? 1 : 1.1 }} className={`w-14 h-14 rounded-full flex items-center justify-center font-mono text-sm font-bold ${!isIntro ? activeNode : inactiveNode}`}>X₁</motion.div>
          <motion.div animate={{ scale: isIntro ? 1 : 1.1 }} className={`w-14 h-14 rounded-full flex items-center justify-center font-mono text-sm font-bold ${!isIntro ? activeNode : inactiveNode}`}>X₂</motion.div>
        </div>

        {/* Hidden Layer */}
        <div className="flex flex-col gap-8 items-center relative z-10 w-[50%]">
          <div className="text-sm font-semibold text-hexagon-text-secondary mb-4">HIDDEN LAYER</div>
          <motion.div className={`w-14 h-14 rounded-full flex items-center justify-center font-mono text-sm font-bold ${!isIntro ? activeNode : inactiveNode}`}>H₁</motion.div>
          <motion.div className={`w-14 h-14 rounded-full flex items-center justify-center font-mono text-sm font-bold ${!isIntro ? activeNode : inactiveNode}`}>H₂</motion.div>
          <motion.div className={`w-14 h-14 rounded-full flex items-center justify-center font-mono text-sm font-bold ${!isIntro ? activeNode : inactiveNode}`}>H₃</motion.div>
          
          {showWeights && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute -right-24 top-10 bg-hexagon-surface border border-hexagon-accent p-3 rounded-xl shadow-lg z-20 w-48"
             >
                <div className="text-xs font-semibold text-hexagon-accent mb-2">ADJUST WEIGHT (w₁)</div>
                <input 
                  type="range" 
                  min="0" max="2" step="0.1" 
                  value={weightValue} 
                  onChange={(e) => onWeightChange(parseFloat(e.target.value))}
                  className="w-full accent-hexagon-accent cursor-pointer"
                />
                <div className="text-right text-xs font-mono mt-1">w₁ = {weightValue.toFixed(2)}</div>
             </motion.div>
          )}
        </div>

        {/* Output Layer */}
        <div className="flex flex-col gap-12 items-center relative z-10 w-[15%]">
          <div className="text-sm font-semibold text-hexagon-text-secondary mb-4">OUTPUT</div>
          <motion.div 
             animate={isSuccess ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
             className={`w-16 h-16 rounded-full flex items-center justify-center font-mono text-base font-bold text-black ${
               isSuccess ? activeNode : 
               (isEvaluating ? inactiveNode : inactiveNode)
             }`}
          >
            Y
          </motion.div>
          {isSuccess && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-10 text-hexagon-accent font-bold">
              MATCH!
            </motion.div>
          )}
        </div>
      </div>

    </div>
  );
}
