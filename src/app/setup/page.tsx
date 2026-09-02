'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

type SetupStep = 'topic' | 'material' | 'level' | 'time' | 'processing';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>('topic');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [time, setTime] = useState('20 min');
  const [loadingText, setLoadingText] = useState('Preparing lesson...');

  const handleNext = (nextStep: SetupStep) => setStep(nextStep);

  const startProcessing = () => {
    setStep('processing');
    setTimeout(() => setLoadingText('Reading material...'), 1000);
    setTimeout(() => setLoadingText('Mapping concepts...'), 2000);
    setTimeout(() => setLoadingText('Choosing learning representations...'), 3500);
    setTimeout(() => setLoadingText('Preparing teacher...'), 5000);
    setTimeout(() => {
      router.push('/lesson/demo-concept');
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative p-6">
      <div className="w-full max-w-2xl relative">
        <AnimatePresence mode="wait">
          
          {step === 'topic' && (
            <motion.div key="topic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-4xl font-bold mb-4">What do you want to learn?</h1>
              <p className="text-muted-foreground mb-8">Enter a topic, goal, or concept.</p>
              <input 
                type="text" 
                autoFocus
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. How neural networks learn"
                className="w-full bg-input/50 border border-border rounded-xl px-6 py-5 text-xl mb-8 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                onKeyDown={e => e.key === 'Enter' && topic && handleNext('level')}
              />
              <div className="flex justify-end">
                <Button size="lg" disabled={!topic} onClick={() => handleNext('level')}>Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 'level' && (
            <motion.div key="level" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-4xl font-bold mb-4">How much do you already know?</h1>
              <p className="text-muted-foreground mb-8">This helps the AI adapt the scaffolding.</p>
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
                <Button variant="ghost" onClick={() => handleNext('topic')}>Back</Button>
                <Button size="lg" onClick={() => handleNext('time')}>Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 'time' && (
            <motion.div key="time" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-4xl font-bold mb-4">How much time do you have?</h1>
              <p className="text-muted-foreground mb-8">We will adjust the depth of the lesson.</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-8">
                {['5 min', '10 min', '20 min', '45 min', '1 hr+'].map(t => (
                  <Card key={t} className={`cursor-pointer transition-all ${time === t ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,255,157,0.1)]' : 'hover:border-white/20'}`} onClick={() => setTime(t)}>
                    <CardContent className="p-4 flex items-center justify-center text-center font-medium">
                      {t}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => handleNext('level')}>Back</Button>
                <Button size="lg" onClick={startProcessing}>Synthesize Lesson</Button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 border-2 border-primary/20 border-t-primary rounded-full" />
                <div className="w-12 h-12 border border-primary/50 rounded-lg rotate-45 flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary rounded-sm shadow-[0_0_15px_rgba(0,255,157,0.8)]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Preparing your lesson...</h2>
              <p className="text-primary font-mono text-sm tracking-widest uppercase">{loadingText}</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
