import { create } from 'zustand';
import { AIIntentState, RepresentationId } from '../types/orchestration';

type AIIntentStore = AIIntentState & {
  setRepresentation: (rep: RepresentationId) => void;
  setScaffoldLevel: (level: number) => void;
  setLessonPhase: (phase: AIIntentState['lessonPhase']) => void;
  setFocusTarget: (targetId: string | undefined) => void;
};

export const useAIIntentStore = create<AIIntentStore>((set) => ({
  activeRepresentation: 'webgl',
  scaffoldLevel: 1,
  schemaData: null,
  lessonPhase: 'Explain',
  focusTargetId: undefined,
  setRepresentation: (rep) => set({ activeRepresentation: rep }),
  setScaffoldLevel: (level) => set({ scaffoldLevel: level }),
  setLessonPhase: (phase) => set({ lessonPhase: phase }),
  setFocusTarget: (targetId) => set({ focusTargetId: targetId }),
}));
