import { z } from "zod";

export const PedagogicalPhaseSchema = z.enum([
  "understand",
  "plan",
  "explain",
  "demonstrate",
  "question",
  "evaluate",
  "adapt",
]);

export type PedagogicalPhase = z.infer<typeof PedagogicalPhaseSchema>;

export const CameraModeSchema = z.enum(["portrait", "classroom", "cinematic", "orbit"]);
export type CameraMode = z.infer<typeof CameraModeSchema>;

export const TeacherStateSchema = z.enum(["idle", "listening", "thinking", "speaking", "demonstrating"]);
export type TeacherState = z.infer<typeof TeacherStateSchema>;

export const UniverseTelemetrySchema = z.object({
  fps: z.number().min(0).max(120),
  cognitiveLoad: z.number().min(0).max(100),
  activePhase: PedagogicalPhaseSchema,
  cameraMode: CameraModeSchema,
  teacherState: TeacherStateSchema,
  audioIntensity: z.number().min(0).max(1),
  sessionTimeRemaining: z.number().nonnegative(),
});

export type UniverseTelemetry = z.infer<typeof UniverseTelemetrySchema>;
