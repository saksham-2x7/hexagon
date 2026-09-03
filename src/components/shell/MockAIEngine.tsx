"use client";
import { useEffect } from 'react';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { useSemanticDispatcher } from '../../lib/api/useSemanticDispatcher';
import { useRouter } from 'next/navigation';
import type { LessonPhase, RepresentationId } from '../../types/orchestration';
import type { TeacherState } from '../../types/teacher';
import type { QuestionProps } from '../../features/assessment/QuestionPanel';

interface LessonSequenceItem {
  phase: LessonPhase;
  representation: RepresentationId;
  teacherState: TeacherState;
  teacherMessage: string;
  question: QuestionProps | null;
}

interface LessonWindow extends Window {
  _lessonState?: { index: number };
  nextLessonStep?: () => void;
  prevLessonStep?: () => void;
}

export const LESSON_SEQUENCE: LessonSequenceItem[] = [
  {
    phase: 'Explain',
    representation: 'webgl',
    teacherState: 'speaking',
    teacherMessage: 'Welcome to this personalized lesson on Neural Networks. Today we are exploring how a network learns.',
    question: null,
  },
  {
    phase: 'Explain',
    representation: 'node',
    teacherState: 'speaking',
    teacherMessage: 'A neural network is essentially a graph of nodes connected by weights. Our goal is to optimize these weights to minimize error.',
    question: null,
  },
  {
    phase: 'Hypothesize',
    representation: 'diagram',
    teacherState: 'waiting',
    teacherMessage: 'Before we build it, think about this: If our current prediction is too low, how should the weight connecting an active input change?',
    question: {
      id: 'q1',
      type: 'multiple_choice' as const,
      prompt: 'If the prediction is too low (and input is positive), how should we adjust the weight?',
      options: ['Decrease the weight', 'Increase the weight', 'Keep it the same'],
      correctOption: 1,
    }
  },
  {
    phase: 'Construct',
    representation: 'manipulation',
    teacherState: 'speaking',
    teacherMessage: 'Exactly right! We increase the weight. Now, try manually dragging the weight sliders to see how it affects the loss surface.',
    question: null,
  },
  {
    phase: 'Evaluate',
    representation: 'timeline',
    teacherState: 'celebrating',
    teacherMessage: 'Excellent work! You have successfully minimized the loss and demonstrated mastery of the basic weight update rule.',
    question: null,
  }
];

export default function MockAIEngine() {
  const router = useRouter();
  const setRepresentation = useAIIntentStore(state => state.setRepresentation);
  const setLessonPhase = useAIIntentStore(state => state.setLessonPhase);
  const setTeacherState = useAIIntentStore(state => state.setTeacherState);
  const setActiveQuestion = useAIIntentStore(state => state.setActiveQuestion);
  
  const events = useSemanticDispatcher(state => state.events);
  
  // Expose control API globally for LessonHUD to use
  useEffect(() => {
    const win = window as unknown as LessonWindow;
    win._lessonState = { index: 0 };
    
    const applyState = (idx: number) => {
      const state = LESSON_SEQUENCE[idx];
      if (!state) return;
      setLessonPhase(state.phase);
      setRepresentation(state.representation);
      setTeacherState(state.teacherState, state.teacherMessage);
      setActiveQuestion(state.question);
    };

    win.nextLessonStep = () => {
      if (win._lessonState && win._lessonState.index < LESSON_SEQUENCE.length - 1) {
        win._lessonState.index++;
        applyState(win._lessonState.index);
      } else {
        router.push('/lesson/summary');
      }
    };

    win.prevLessonStep = () => {
      if (win._lessonState && win._lessonState.index > 0) {
        win._lessonState.index--;
        applyState(win._lessonState.index);
      }
    };

    // Initial state
    applyState(0);
    
    // Auto advance first few steps to mimic AI talking
    const t1 = setTimeout(() => win.nextLessonStep?.(), 6000);
    const t2 = setTimeout(() => win.nextLessonStep?.(), 14000);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      delete win.nextLessonStep;
      delete win.prevLessonStep;
    };
  }, [setRepresentation, setLessonPhase, setTeacherState, setActiveQuestion, router]);

  // Reactive Event Loop
  useEffect(() => {
    if (events.length === 0) return;
    const lastEvent = events[events.length - 1];

    if (lastEvent.type === 'answer_submitted') {
      if (lastEvent.answer === '1') {
        setTeacherState('celebrating', 'Correct! By increasing the weight, we boost the output prediction to reduce the error.');
        setTimeout(() => {
          (window as unknown as LessonWindow).nextLessonStep?.();
        }, 4000);
      } else {
        setTeacherState('correcting', 'Not quite. If we decrease it, the prediction goes even lower. Let\'s look at a timeline of previous adjustments.');
        setTimeout(() => {
          setRepresentation('timeline');
          setLessonPhase('Observe');
          setTeacherState('speaking', 'Notice how every time the weight decreased in the past, the error went up?');
          
          setTimeout(() => {
            setLessonPhase('Question');
            setRepresentation('diagram');
            setTeacherState('waiting', 'Now that you see the history, try the question again.');
            setActiveQuestion({
              id: 'q1_retry',
              type: 'multiple_choice' as const,
              prompt: 'To raise the prediction, we should...',
              options: ['Decrease the weight', 'Increase the weight'],
              correctOption: 1,
            });
          }, 7000);
        }, 5000);
      }
    }
  }, [events, setRepresentation, setLessonPhase, setTeacherState, setActiveQuestion]);

  return null;
}
