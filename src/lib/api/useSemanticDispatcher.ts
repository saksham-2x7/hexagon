import { create } from 'zustand';
import { SemanticEvent } from '../../types/semantic-events';

type SemanticDispatcherState = {
  events: SemanticEvent[];
  dispatchAction: (event: SemanticEvent) => void;
};

export const useSemanticDispatcher = create<SemanticDispatcherState>((set) => ({
  events: [],
  dispatchAction: (event) => set((state) => {
    const newEvents = [...state.events, event];
    // Keep only the last 5 events
    if (newEvents.length > 5) {
      newEvents.shift();
    }
    return { events: newEvents };
  }),
}));
