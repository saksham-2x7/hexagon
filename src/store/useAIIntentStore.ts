import { create } from 'zustand';
import { AIIntentState } from '../types/orchestration';

type AIIntentStore = AIIntentState & {
  setRepresentation: (rep: 'webgl' | 'node') => void;
  setScaffoldLevel: (level: number) => void;
};

export const useAIIntentStore = create<AIIntentStore>((set) => ({
  activeRepresentation: 'webgl',
  scaffoldLevel: 1,
  schemaData: null,
  setRepresentation: (rep) => set({ activeRepresentation: rep }),
  setScaffoldLevel: (level) => set({ scaffoldLevel: level }),
}));
