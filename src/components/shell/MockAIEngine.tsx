'use client';
import { useEffect, useRef } from 'react';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { useSemanticDispatcher } from '../../lib/api/useSemanticDispatcher';
import { LessonPhase, RepresentationId } from '../../types/orchestration';
import { TeacherState } from '../../types/teacher';
import { useRouter } from 'next/navigation';

export default function MockAIEngine() {
  const router = useRouter();
  const setRepresentation = useAIIntentStore(state => state.setRepresentation);
  const setLessonPhase = useAIIntentStore(state => state.setLessonPhase);
  const setTeacherState = useAIIntentStore(state => state.setTeacherState);
  const setActiveQuestion = useAIIntentStore(state => state.setActiveQuestion);
  
  const events = useSemanticDispatcher(state => state.events);
  const initialized = useRef(false);

  // Initial Sequence
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Introduction
    setTimeout(() => {
      setLessonPhase('Explain');
      setRepresentation('webgl');
      setTeacherState('speaking', 'Welcome. Today we are exploring how a Neural Network learns.');
    }, 1000);

    // Concept Node View
    setTimeout(() => {
      setLessonPhase('Explain');
      setRepresentation('node');
      setTeacherState('speaking', 'A neural network is a graph of nodes, connected by weights. We must optimize these weights.');
    }, 6000);

    // Question
    setTimeout(() => {
      setLessonPhase('Question');
      setRepresentation('diagram');
      setTeacherState('waiting', 'If our current prediction is too low, how should the weight connecting the active input change?');
      setActiveQuestion({
        id: 'q1',
        type: 'multiple_choice',
        prompt: 'If the prediction is too low (and input is positive), how should we adjust the weight?',
        options: ['Decrease the weight', 'Increase the weight', 'Keep it the same'],
        correctOption: 1,
      });
    }, 13000);

  }, [setRepresentation, setLessonPhase, setTeacherState, setActiveQuestion]);

  // Reactive Event Loop
  useEffect(() => {
    if (events.length === 0) return;
    const lastEvent = events[events.length - 1];

    if (lastEvent.type === 'answer_submitted') {
      if (lastEvent.answer === '1') { // Correct answer index in our mock
        setTeacherState('celebrating', 'Exactly! We increase the weight to reduce the error.');
        setTimeout(() => {
          setActiveQuestion(null);
          setLessonPhase('Construct');
          setRepresentation('manipulation');
          setTeacherState('speaking', 'Let\'s try doing this manually. Assemble the neural layers to minimize loss.');
          
          // Complete Lesson after a bit
          setTimeout(() => {
            setLessonPhase('Evaluate');
            setTeacherState('speaking', 'Excellent work. Your mastery has increased.');
            setTimeout(() => {
              router.push('/lesson/summary');
            }, 4000);
          }, 8000);
        }, 3000);
      } else {
        // Misconception Loop
        setTeacherState('correcting', 'Not quite. If we decrease it, the prediction goes even lower. Let\'s trace the history.');
        setTimeout(() => {
          setActiveQuestion(null);
          setLessonPhase('Observe');
          setRepresentation('timeline');
          setTeacherState('speaking', 'Look at the timeline. Every time the weight decreased, the error went up.');
          
          // Ask again after reviewing
          setTimeout(() => {
            setLessonPhase('Question');
            setRepresentation('diagram');
            setTeacherState('waiting', 'Now that you see the history, let\'s try again.');
            setActiveQuestion({
              id: 'q1_retry',
              type: 'multiple_choice',
              prompt: 'To raise the prediction, we should...',
              options: ['Decrease the weight', 'Increase the weight'],
              correctOption: 1,
            });
          }, 6000);
        }, 5000);
      }
    }
  }, [events, setRepresentation, setLessonPhase, setTeacherState, setActiveQuestion, router]);

  return null;
}
