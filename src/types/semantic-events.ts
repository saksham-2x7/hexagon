import { RepresentationId } from './orchestration';

export type SemanticEvent = 
  | { type: 'REPRESENTATION_CHANGED'; representation: RepresentationId }
  | { type: 'SCAFFOLD_ADJUSTED'; level: number }
  | { type: 'LEARNER_INPUT'; data: string }
  | { type: 'NODE_CONNECTED'; source: string; target: string }
  | { type: '3D_OBJECT_INTERACTED'; target: string }
  | { type: 'concept_hovered'; conceptId: string }
  | { type: 'concept_selected'; conceptId: string }
  | { type: 'concept_opened'; conceptId: string }
  | { type: 'object_drag_started'; objectId: string }
  | { type: 'object_drag_completed'; objectId: string; offset: { x: number, y: number } }
  | { type: 'object_dropped'; objectId: string; targetId: string }
  | { type: 'parameter_changed'; parameter: string; value: number | string }
  | { type: 'answer_submitted'; answer: string }
  | { type: 'hypothesis_submitted'; hypothesis: string }
  | { type: 'experiment_started' }
  | { type: 'experiment_completed' }
  | { type: 'hint_requested' }
  | { type: 'teacher_interaction'; action: string }
  | { type: 'lesson_completed' };
