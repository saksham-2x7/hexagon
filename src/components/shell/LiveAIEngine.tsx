"use client";
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { useSemanticDispatcher } from '../../lib/api/useSemanticDispatcher';
import { useAudioLipSync } from '../../hooks/useAudioLipSync';
import { liveSSEClient } from '../../services/liveSSEClient';
import { speechSynthesizer } from '../../services/speechSynthesizer';
import { LESSON_SEQUENCE } from './MockAIEngine';
import type { LessonPhase, RepresentationId } from '../../types/orchestration';
import type { TeacherState } from '../../types/teacher';

interface LessonWindow extends Window {
  _lessonState?: { index: number };
  nextLessonStep?: () => void;
  prevLessonStep?: () => void;
}

export default function LiveAIEngine() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') || (typeof window !== 'undefined' ? sessionStorage.getItem('hexagon_session_id') : null);

  const setRepresentation = useAIIntentStore(state => state.setRepresentation);
  const setLessonPhase = useAIIntentStore(state => state.setLessonPhase);
  const setTeacherState = useAIIntentStore(state => state.setTeacherState);
  const setActiveQuestion = useAIIntentStore(state => state.setActiveQuestion);
  const setScaffoldLevel = useAIIntentStore(state => state.setScaffoldLevel);

  const { connectAudioElement } = useAudioLipSync();
  const events = useSemanticDispatcher(state => state.events);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const localIndexRef = useRef(0);

  // 1. Live SSE Backend Stream Connection
  useEffect(() => {
    if (!sessionId) return;

    const disconnect = liveSSEClient.connectStream(sessionId, {
      onConnected: () => {
        setIsLiveConnected(true);
      },
      onTeachingTurn: (turn) => {
        if (turn.phase) setLessonPhase(turn.phase);
        if (turn.teacher_state) {
          setTeacherState(turn.teacher_state, turn.message);
        }
        if (turn.question !== undefined) {
          setActiveQuestion(turn.question);
        }
      },
      onVisualIntent: (intent) => {
        if (intent.representation) setRepresentation(intent.representation);
        if (intent.scaffold_level) setScaffoldLevel(intent.scaffold_level);
      },
      onAudioReady: (audioEl) => {
        connectAudioElement(audioEl);
      },
      onError: () => {
        setIsLiveConnected(false);
      }
    });

    return () => {
      disconnect();
    };
  }, [sessionId, setLessonPhase, setTeacherState, setActiveQuestion, setRepresentation, setScaffoldLevel, connectAudioElement]);

  // 2. Resilient Sequence Stepper (Supports both live and mock fallback)
  useEffect(() => {
    const win = window as unknown as LessonWindow;
    win._lessonState = { index: localIndexRef.current };

    const applyState = (idx: number) => {
      const state = LESSON_SEQUENCE[idx];
      if (!state) return;
      setLessonPhase(state.phase);
      setRepresentation(state.representation);
      setTeacherState(state.teacherState, state.teacherMessage);
      setActiveQuestion(state.question);

      // Speak current step out loud with natural educator voice & real lip-sync
      speechSynthesizer.speak(state.teacherMessage);
    };

    win.nextLessonStep = () => {
      if (win._lessonState && win._lessonState.index < LESSON_SEQUENCE.length - 1) {
        win._lessonState.index++;
        localIndexRef.current = win._lessonState.index;
        applyState(win._lessonState.index);
      } else {
        router.push('/lesson/summary');
      }
    };

    win.prevLessonStep = () => {
      if (win._lessonState && win._lessonState.index > 0) {
        win._lessonState.index--;
        localIndexRef.current = win._lessonState.index;
        applyState(win._lessonState.index);
      }
    };

    // If live SSE is not streaming a turn immediately, load step 0
    if (!isLiveConnected) {
      applyState(0);
    }

    return () => {
      delete win.nextLessonStep;
      delete win.prevLessonStep;
      speechSynthesizer.stop();
    };
  }, [isLiveConnected, setLessonPhase, setRepresentation, setTeacherState, setActiveQuestion, router]);

  // 3. Reactive Event Handler (Answers & Interactivity)
  useEffect(() => {
    if (events.length === 0) return;
    const lastEvent = events[events.length - 1];

    if (lastEvent.type === 'answer_submitted') {
      if (lastEvent.answer === '1') {
        const praise = 'Correct! By increasing the weight, we boost the output prediction to reduce the error.';
        setTeacherState('celebrating', praise);
        speechSynthesizer.speak(praise);

        setTimeout(() => {
          (window as unknown as LessonWindow).nextLessonStep?.();
        }, 4000);
      } else {
        const retryMsg = 'Not quite. If we decrease it, the prediction goes even lower. Let\'s look at a timeline of previous adjustments.';
        setTeacherState('correcting', retryMsg);
        speechSynthesizer.speak(retryMsg);

        setTimeout(() => {
          setRepresentation('timeline');
          setLessonPhase('Observe');
          const observeMsg = 'Notice how every time the weight decreased in the past, the error went up?';
          setTeacherState('speaking', observeMsg);
          speechSynthesizer.speak(observeMsg);

          setTimeout(() => {
            setLessonPhase('Question');
            setRepresentation('diagram');
            const retryPrompt = 'Now that you see the history, try the question again.';
            setTeacherState('waiting', retryPrompt);
            speechSynthesizer.speak(retryPrompt);
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
  }, [events, setTeacherState, setRepresentation, setLessonPhase, setActiveQuestion]);

  return null;
}
