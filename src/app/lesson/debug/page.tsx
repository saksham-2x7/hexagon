'use client';
import LessonShell from '../../../components/shell/LessonShell';
import PolymorphicOrchestrator from '../../../components/orchestrator/PolymorphicOrchestrator';
import { useAIIntentStore } from '../../../store/useAIIntentStore';
import { getAllRepresentations } from '../../../lib/registry/RepresentationRegistry';

export default function DebugLessonPage() {
  const { activeRepresentation, setRepresentation, lessonPhase, setLessonPhase } = useAIIntentStore();
  const reps = getAllRepresentations();

  return (
    <LessonShell>
      <div className="absolute top-6 right-6 z-50 flex flex-col gap-4">
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
                onClick={() => setLessonPhase(phase as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${lessonPhase === phase ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>
      </div>
      <PolymorphicOrchestrator />
    </LessonShell>
  );
}
