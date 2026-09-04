export type TeacherState = 'idle' | 'speaking' | 'listening' | 'thinking' | 'teaching' | 'pointing' | 'questioning' | 'waiting' | 'celebrating' | 'correcting' | 'concerned' | 'paused';

export interface TeacherContext {
  state: TeacherState;
  message: string | null;
  captionText: string | null;
  isMuted: boolean;
}
