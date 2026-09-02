import { create } from 'zustand';

type InteractionState = {
  isDragging: boolean;
  activeItemId: string | null;
  cameraAngle: number;
  setDragging: (isDragging: boolean, itemId?: string) => void;
  setCameraAngle: (angle: number) => void;
};

export const useInteractionStore = create<InteractionState>((set) => ({
  isDragging: false,
  activeItemId: null,
  cameraAngle: 0,
  setDragging: (isDragging, itemId) => set({ isDragging, activeItemId: itemId || null }),
  setCameraAngle: (angle) => set({ cameraAngle: angle }),
}));
