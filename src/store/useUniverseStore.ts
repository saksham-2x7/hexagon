import { create } from "zustand";
import { 
  PedagogicalPhase, 
  CameraMode, 
  TeacherState, 
  UniverseTelemetry, 
  UniverseTelemetrySchema 
} from "@/schemas/universe";

interface UniverseState {
  // Bridge state
  activePhase: PedagogicalPhase;
  cameraMode: CameraMode;
  teacherState: TeacherState;
  audioIntensity: number;
  cognitiveLoad: number;
  fps: number;
  sessionTimeRemaining: number;

  // Actions
  setActivePhase: (phase: PedagogicalPhase) => void;
  setCameraMode: (mode: CameraMode) => void;
  setTeacherState: (state: TeacherState) => void;
  setAudioIntensity: (intensity: number) => void;
  updateTelemetry: (telemetry: Partial<UniverseTelemetry>) => void;
}

export const useUniverseStore = create<UniverseState>((set) => ({
  activePhase: "understand",
  cameraMode: "cinematic",
  teacherState: "idle",
  audioIntensity: 0,
  cognitiveLoad: 35,
  fps: 60,
  sessionTimeRemaining: 1200,

  setActivePhase: (activePhase) => set({ activePhase }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setTeacherState: (teacherState) => set({ teacherState }),
  setAudioIntensity: (audioIntensity) => set({ audioIntensity }),
  updateTelemetry: (partialTelemetry) => {
    // Optional strict validation when telemetry updates come from outside APIs
    set((state) => {
      const merged = {
        fps: partialTelemetry.fps ?? state.fps,
        cognitiveLoad: partialTelemetry.cognitiveLoad ?? state.cognitiveLoad,
        activePhase: partialTelemetry.activePhase ?? state.activePhase,
        cameraMode: partialTelemetry.cameraMode ?? state.cameraMode,
        teacherState: partialTelemetry.teacherState ?? state.teacherState,
        audioIntensity: partialTelemetry.audioIntensity ?? state.audioIntensity,
        sessionTimeRemaining: partialTelemetry.sessionTimeRemaining ?? state.sessionTimeRemaining,
      };

      const result = UniverseTelemetrySchema.safeParse(merged);
      if (result.success) {
        return result.data;
      }
      return state;
    });
  },
}));
