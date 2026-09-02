'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { UploadCloud, FileText } from 'lucide-react';

type SetupStep = 'topic' | 'material' | 'level' | 'goal' | 'time' | 'language' | 'processing';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>('topic');
  
  const [topic, setTopic] = useState('');
  const [material, setMaterial] = useState<File | null>(null);
  const [level, setLevel] = useState('Beginner');
  const [goal, setGoal] = useState('Understand Basics');
  const [time, setTime] = useState('20 min');
  const [language, setLanguage] = useState('English');
  
  const [loadingText, setLoadingText] = useState('Preparing lesson...');

  const handleNext = (nextStep: SetupStep) => setStep(nextStep);

  const startProcessing = () => {
    setStep('processing');
    setTimeout(() => setLoadingText('Analyzing ' + (material ? material.name : 'topic') + '...'), 1000);
    setTimeout(() => setLoadingText('Mapping concepts to Knowledge Graph...'), 2500);
    setTimeout(() => setLoadingText('Allocating polymorphic representations...'), 4000);
    setTimeout(() => setLoadingText('Booting Teacher AI...'), 5500);
    setTimeout(() => {
      router.push('/lesson/demo-concept');
    }, 7000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative p-6">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          
          {step === 'topic' && (
            <motion.div key="topic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-primary font-mono text-sm mb-4">Step 1 of 6</div>
              <h1 className="text-4xl font-bold mb-4 tracking-tight">What do you want to learn?</h1>
              <p className="text-muted-foreground mb-8">Enter a topic, subject, or specific concept you want to master.</p>
              <input 
                type="text" 
                autoFocus
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. How neural networks learn"
                className="w-full bg-input/50 border border-white/10 rounded-xl px-6 py-5 text-xl mb-8 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                onKeyDown={e => e.key === 'Enter' && topic && handleNext('material')}
              />
              <div className="flex justify-end">
                <Button size="lg" disabled={!topic} onClick={() => handleNext('material')}>Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 'material' && (
            <motion.div key="material" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-primary font-mono text-sm mb-4">Step 2 of 6</div>
              <h1 className="text-4xl font-bold mb-4 tracking-tight">Got any source material?</h1>
              <p className="text-muted-foreground mb-8">Upload a PDF, notes, or syllabus. We&apos;ll ground the lesson in your materials. (Optional)</p>
              
              <div className="w-full border-2 border-dashed border-white/10 hover:border-primary/50 bg-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all mb-8 cursor-pointer relative">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={e => e.target.files && setMaterial(e.target.files[0])}
                  accept=".pdf,.txt,.docx"
                />
                {material ? (
                  <>
                    <FileText className="w-12 h-12 text-primary mb-4" />
                    <p className="text-xl font-medium text-white">{material.name}</p>
                    <p className="text-sm text-white/50 mt-2">Ready to process</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-white/30 mb-4" />
                    <p className="text-lg font-medium text-white/70">Click or drag file here</p>
                    <p className="text-sm text-white/40 mt-2">PDF, DOCX, TXT</p>
                  </>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => handleNext('topic')}>Back</Button>
                <Button size="lg" onClick={() => handleNext('level')}>
                  {material ? 'Continue' : 'Skip'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'level' && (
            <motion.div key="level" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-primary font-mono text-sm mb-4">Step 3 of 6</div>
              <h1 className="text-4xl font-bold mb-4 tracking-tight">Current knowledge level</h1>
              <p className="text-muted-foreground mb-8">This sets the initial scaffolding for the polymorphic UI.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {['New', 'Beginner', 'Intermediate', 'Advanced'].map(l => (
                  <Card key={l} className={`cursor-pointer transition-all ${level === l ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,255,157,0.1)]' : 'hover:border-white/20'}`} onClick={() => setLevel(l)}>
                    <CardContent className="p-6 flex items-center justify-center text-center font-medium">
                      {l}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => handleNext('material')}>Back</Button>
                <Button size="lg" onClick={() => handleNext('goal')}>Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 'goal' && (
            <motion.div key="goal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-primary font-mono text-sm mb-4">Step 4 of 6</div>
              <h1 className="text-4xl font-bold mb-4 tracking-tight">What is your goal?</h1>
              <p className="text-muted-foreground mb-8">This changes how the teacher orchestrates the lesson.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  { id: 'Understand Basics', desc: 'Conceptual focus' },
                  { id: 'Prepare for Exam', desc: 'Rigorous assessment' },
                  { id: 'Practical Application', desc: 'Code and math focus' },
                  { id: 'Deep Dive', desc: 'Explore all edge cases' }
                ].map(g => (
                  <Card key={g.id} className={`cursor-pointer transition-all ${goal === g.id ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,255,157,0.1)]' : 'hover:border-white/20'}`} onClick={() => setGoal(g.id)}>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                      <div className="font-medium mb-1">{g.id}</div>
                      <div className="text-xs text-white/50">{g.desc}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => handleNext('level')}>Back</Button>
                <Button size="lg" onClick={() => handleNext('time')}>Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 'time' && (
            <motion.div key="time" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-primary font-mono text-sm mb-4">Step 5 of 6</div>
              <h1 className="text-4xl font-bold mb-4 tracking-tight">How much time do you have?</h1>
              <p className="text-muted-foreground mb-8">We will adjust the depth and number of interactive modules.</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-8">
                {['5 min', '10 min', '20 min', '45 min', '1 hr+'].map(t => (
                  <Card key={t} className={`cursor-pointer transition-all ${time === t ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,255,157,0.1)]' : 'hover:border-white/20'}`} onClick={() => setTime(t)}>
                    <CardContent className="p-4 flex items-center justify-center text-center font-medium text-sm">
                      {t}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => handleNext('goal')}>Back</Button>
                <Button size="lg" onClick={() => handleNext('language')}>Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 'language' && (
            <motion.div key="language" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-primary font-mono text-sm mb-4">Step 6 of 6</div>
              <h1 className="text-4xl font-bold mb-4 tracking-tight">Language Preference</h1>
              <p className="text-muted-foreground mb-8">The AI teacher can speak in multiple languages dynamically.</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {['English', 'Hindi', 'Kannada', 'Hinglish'].map(l => (
                  <Card key={l} className={`cursor-pointer transition-all ${language === l ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,255,157,0.1)]' : 'hover:border-white/20'}`} onClick={() => setLanguage(l)}>
                    <CardContent className="p-6 flex items-center justify-center text-center font-medium">
                      {l}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => handleNext('time')}>Back</Button>
                <Button size="lg" onClick={startProcessing}>Synthesize Lesson</Button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-32 h-32 mb-10 relative flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-0 border-2 border-primary/20 border-t-primary rounded-full shadow-[0_0_30px_rgba(0,255,157,0.2)]" />
                <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute inset-2 border border-white/10 border-b-white/50 rounded-full" />
                <div className="w-16 h-16 border-2 border-primary/50 bg-background rounded-xl rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,157,0.4)]">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-6 h-6 bg-primary rounded-sm shadow-[0_0_20px_rgba(0,255,157,1)]" 
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4 tracking-tight">Constructing Environment...</h2>
              <p className="text-primary font-mono text-sm tracking-widest uppercase h-6">{loadingText}</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
