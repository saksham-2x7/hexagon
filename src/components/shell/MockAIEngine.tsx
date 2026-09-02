'use client';
import { useEffect, useRef } from 'react';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { LessonPhase, RepresentationId } from '../../types/orchestration';
import { TeacherState } from '../../types/teacher';

const TEACHING_SEQUENCE = [
  { delay: 2000, phase: 'Explain' as LessonPhase, rep: 'webgl' as RepresentationId, teacherState: 'speaking' as TeacherState, msg: 'Welcome. Today we are exploring neural network weight updates.' },
  { delay: 8000, phase: 'Observe' as LessonPhase, rep: 'node' as RepresentationId, teacherState: 'speaking' as TeacherState, msg: 'Notice how the weights flow between these nodes.' },
  { delay: 15000, phase: 'Construct' as LessonPhase, rep: 'manipulation' as RepresentationId, teacherState: 'waiting' as TeacherState, msg: 'Try adjusting the learning rate slider.' },
  { delay: 25000, phase: 'Resolve' as LessonPhase, rep: 'diagram' as RepresentationId, teacherState: 'speaking' as TeacherState, msg: 'By tuning it correctly, convergence is achieved.' },
  { delay: 35000, phase: 'Evaluate' as LessonPhase, rep: 'graph' as RepresentationId, teacherState: 'speaking' as TeacherState, msg: 'Look at the loss curve dropping over time.' },
  { delay: 45000, phase: 'Explain' as LessonPhase, rep: 'text' as RepresentationId, teacherState: 'idle' as TeacherState, msg: 'Great job completing this interactive module.' }
];

export default function MockAIEngine() {
  const setRepresentation = useAIIntentStore(state => state.setRepresentation);
  const setLessonPhase = useAIIntentStore(state => state.setLessonPhase);
  const setTeacherState = useAIIntentStore(state => state.setTeacherState);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    TEACHING_SEQUENCE.forEach((step) => {
      setTimeout(() => {
        setLessonPhase(step.phase);
        setRepresentation(step.rep);
        setTeacherState(step.teacherState, step.msg);
      }, step.delay);
    });
  }, [setRepresentation, setLessonPhase, setTeacherState]);

  return null;
}
