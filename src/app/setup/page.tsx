'use client';
import { useState } from 'react';
import PremiumSlider from '../../components/ui/PremiumSlider';
import DragDropZone from '../../components/ui/DragDropZone';
import AnimatedSelector from '../../components/ui/AnimatedSelector';
import { LearnerProfile } from '../../types/learner';

export default function SetupPage() {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState(3);
  const [learningStyle, setLearningStyle] = useState('visual');
  const [hasMaterials, setHasMaterials] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: LearnerProfile = {
      topic,
      depthLevel: depth,
      learningStyle: learningStyle as any,
      hasMaterials,
    };
    console.log("Learner Profile Generated:", profile);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-8 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Initialize Learner</h1>
          <p className="text-sm text-gray-400">Configure the polymorphic kernel parameters.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Topic</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              placeholder="e.g. Quantum Computing"
              required
            />
          </div>

          <PremiumSlider value={depth} onChange={setDepth} />

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Style</label>
            <AnimatedSelector 
              options={['visual', 'kinesthetic', 'auditory', 'reading']} 
              selected={learningStyle}
              onChange={setLearningStyle}
            />
          </div>

          <DragDropZone onUpload={() => setHasMaterials(true)} />

          <button type="submit" className="w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] text-sm tracking-wide">
            INITIALIZE KERNEL
          </button>
        </form>
      </div>
    </div>
  );
}

