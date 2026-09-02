'use client';
import { useState } from 'react';
import LessonShell from '../../../components/shell/LessonShell';
import PolymorphicOrchestrator from '../../../components/orchestrator/PolymorphicOrchestrator';
import { useAIIntentStore } from '../../../store/useAIIntentStore';
import { getAllRepresentations } from '../../../lib/registry/RepresentationRegistry';
import MockAIEngine from '../../../components/shell/MockAIEngine';

export default function DebugLessonPage() {
  const { activeRepresentation, setRepresentation, lessonPhase, setLessonPhase, scaffoldLevel, setScaffoldLevel } = useAIIntentStore();
  const reps = getAllRepresentations();
  const [engineActive, setEngineActive] = useState(false);

  return (
    <LessonShell>
      {engineActive && <MockAIEngine />}
      <div className="absolute top-24 right-6 z-50 flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2 pb-10">
        
        {/* Mock Engine Control */}
        <div className="bg-hexagon-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-2 w-64">
          <button 
            onClick={() => setEngineActive(!engineActive)}
            className={`w-full py-2 text-xs font-bold tracking-widest rounded-lg transition-all uppercase ${engineActive ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-hexagon-accent text-black shadow-[0_0_15px_rgba(0,255,157,0.5)]'}`}
          >
            {engineActive ? 'Stop Mock Engine' : 'Start Mock Engine'}
          </button>
        </div>

        {/* Representation Controls */}
        <div className="bg-hexagon-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-2 w-64">
          <h3 className="text-xs font-mono text-white/50 tracking-widest uppercase mb-1">Representation</h3>
          <div className="flex flex-wrap gap-2">
            {reps.map(r => (
              <button 
                key={r.metadata.id}
                onClick={() => setRepresentation(r.metadata.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeRepresentation === r.metadata.id ? 'bg-hexagon-accent text-black shadow-[0_0_15px_rgba(0,255,157,0.5)]' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                {r.metadata.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lesson Phase Controls */}
        <div className="bg-hexagon-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-2 w-64">
          <h3 className="text-xs font-mono text-white/50 tracking-widest uppercase mb-1">Lesson Phase</h3>
          <div className="flex flex-wrap gap-2">
            {['Explain', 'Hypothesize', 'Construct', 'Observe', 'Resolve', 'Question', 'Evaluate'].map(phase => (
              <button 
                key={phase}
                onClick={() => setLessonPhase(phase as import('../../../types/orchestration').AIIntentState['lessonPhase'])}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${lessonPhase === phase ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>

        {/* Scaffold Controls */}
        <div className="bg-hexagon-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-2 w-64">
          <h3 className="text-xs font-mono text-white/50 tracking-widest uppercase mb-1">Scaffold</h3>
          <input 
            type="range" 
            min="1" 
            max="4" 
            value={scaffoldLevel} 
            onChange={(e) => setScaffoldLevel(Number(e.target.value))}
            className="w-full accent-hexagon-accent"
          />
          <div className="flex justify-between text-[10px] font-mono text-white/40">
            <span>Max</span>
            <span>Indep</span>
          </div>
        </div>
      </div>
      <PolymorphicOrchestrator />
    </LessonShell>
  );
}
