'use client';

export default function MockNodeRepresentation() {
  return (
    <div className="w-full h-full bg-gray-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>
      
      <div className="relative z-10 grid grid-cols-3 gap-8 p-12">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="w-32 h-24 border border-blue-500/30 rounded-xl bg-gray-900/80 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <span className="text-gray-400 font-mono text-sm">Node_{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

