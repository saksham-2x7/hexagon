'use client';
import { useSemanticDispatcher } from '../../lib/api/useSemanticDispatcher';

export default function LessonHUD() {
  const events = useSemanticDispatcher((state) => state.events);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-6">
      
      {/* Top Bar */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 shadow-lg">
          <h2 className="text-gray-300 text-xs tracking-widest uppercase font-semibold mb-2">Current Topic</h2>
          <div className="text-xl font-bold text-white tracking-tight">Cellular Respiration</div>
        </div>
        
        {/* Progress/Mastery Bar */}
        <div className="w-64 bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 shadow-lg flex flex-col gap-2">
          <div className="flex justify-between text-xs text-gray-400 font-medium">
            <span>MASTERY</span>
            <span className="text-blue-400">72%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[72%] shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
          </div>
        </div>
      </div>

      {/* Bottom-left Event Log */}
      <div className="w-96 bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 shadow-lg pointer-events-auto flex flex-col gap-2 max-h-64 overflow-hidden">
        <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-2">Semantic Event Log</h3>
        <div className="flex flex-col gap-2 overflow-y-auto">
          {events.length === 0 && <span className="text-gray-600 text-sm font-mono italic">No events yet...</span>}
          {events.map((ev, i) => (
            <div key={i} className="text-xs font-mono text-green-400 bg-black/40 p-2 rounded border border-green-900/30">
              {'>'} {JSON.stringify(ev)}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
