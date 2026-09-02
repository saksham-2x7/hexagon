'use client';
import { useEffect, useRef } from 'react';
import { useAIIntentStore } from '../../store/useAIIntentStore';

const TEACHING_SEQUENCE = [
  { delay: 3000, phase: 'Explain', rep: 'text', msg: 'Welcome. Today we are exploring the concept of Hexagonal Architecture.' },
  { delay: 8000, phase: 'Observe', rep: 'diagram', msg: 'Notice the core logic is surrounded by adapters. This is the essence of ports and adapters.' },
  { delay: 15000, phase: 'Construct', rep: 'manipulation', msg: 'Try assembling the components. Drag component A and B into the core.' },
  { delay: 25000, phase: 'Resolve', rep: 'node', msg: 'By separating concerns, we achieve this concept graph.' },
  { delay: 35000, phase: 'Evaluate', rep: 'graph', msg: 'Look at how this improves our testing velocity over time.' },
  { delay: 45000, phase: 'Explain', rep: 'webgl', msg: 'In a 3D structural sense, it looks like this floating module.' }
];

export default function MockAIEngine() {
  const { setRepresentation, setLessonPhase } = useAIIntentStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    TEACHING_SEQUENCE.forEach((step) => {
      setTimeout(() => {
        setLessonPhase(step.phase as import('../../types/orchestration').AIIntentState['lessonPhase']);
        setRepresentation(step.rep as import('../../types/orchestration').RepresentationId);
        // Here we could dispatch an event to the teacher to say step.msg
      }, step.delay);
    });
  }, [setRepresentation, setLessonPhase]);

  return null;
}
