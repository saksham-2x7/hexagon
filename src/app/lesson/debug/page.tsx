'use client';
import LessonShell from '../../../components/shell/LessonShell';
import PolymorphicOrchestrator from '../../../components/orchestrator/PolymorphicOrchestrator';
import { useAIIntentStore } from '../../../store/useAIIntentStore';

export default function DebugLessonPage() {
  const { activeRepresentation, setRepresentation } = useAIIntentStore();

  return (
    <LessonShell>
      <div className="absolute top-6 right-6 z-50 flex gap-4">
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl p-4 flex gap-4 shadow-2xl">
          <button 
            onClick={() => setRepresentation('webgl')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeRepresentation === 'webgl' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            WebGL
          </button>
          <button 
            onClick={() => setRepresentation('node')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeRepresentation === 'node' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            Node
          </button>
        </div>
      </div>
      <PolymorphicOrchestrator />
    </LessonShell>
  );
}

