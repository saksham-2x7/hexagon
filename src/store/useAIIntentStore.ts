import { create } from 'zustand';
import { AIIntentState, LessonPhase, RepresentationId } from '../types/orchestration';
import { TeacherState } from '../types/teacher';

interface AIIntentStore extends AIIntentState {
  teacherState: TeacherState;
  teacherMessage: string;
  setRepresentation: (id: RepresentationId) => void;
  setLessonPhase: (phase: LessonPhase) => void;
  setScaffoldLevel: (level: number) => void;
  setTeacherState: (state: TeacherState, message: string) => void;
}

export const useAIIntentStore = create<AIIntentStore>((set) => ({
  activeRepresentation: 'webgl',
  lessonPhase: 'Explain',
  focusTargetId: null,
  scaffoldLevel: 3, // High scaffolding
  teacherState: 'idle',
  teacherMessage: '',

  setRepresentation: (id) => set({ activeRepresentation: id }),
  setLessonPhase: (phase) => set({ lessonPhase: phase }),
  setScaffoldLevel: (level) => set({ scaffoldLevel: level }),
  setTeacherState: (state, message) => set({ teacherState: state, teacherMessage: message }),
}));
