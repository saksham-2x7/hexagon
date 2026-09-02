'use client';
import { useEffect, useRef } from 'react';
import { useAIIntentStore } from '../../store/useAIIntentStore';

const TEACHING_SEQUENCE = [
  { delay: 2000, phase: 'Explain', rep: 'webgl', teacherState: 'speaking', msg: 'Welcome. Today we are exploring neural network weight updates.' },
  { delay: 8000, phase: 'Observe', rep: 'node', teacherState: 'speaking', msg: 'Notice how the weights flow between these nodes.' },
  { delay: 15000, phase: 'Construct', rep: 'manipulation', teacherState: 'waiting', msg: 'Try adjusting the learning rate slider.' },
  { delay: 25000, phase: 'Resolve', rep: 'diagram', teacherState: 'speaking', msg: 'By tuning it correctly, convergence is achieved.' },
  { delay: 35000, phase: 'Evaluate', rep: 'graph', teacherState: 'speaking', msg: 'Look at the loss curve dropping over time.' },
  { delay: 45000, phase: 'Explain', rep: 'text', teacherState: 'idle', msg: 'Great job completing this interactive module.' }
];

export default function MockAIEngine() {
  const { setRepresentation, setLessonPhase, setTeacherState } = useAIIntentStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    TEACHING_SEQUENCE.forEach((step) => {
      setTimeout(() => {
        setLessonPhase(step.phase as any);
        setRepresentation(step.rep as any);
        setTeacherState(step.teacherState as any, step.msg);
      }, step.delay);
    });
  }, [setRepresentation, setLessonPhase, setTeacherState]);

  return null;
}
