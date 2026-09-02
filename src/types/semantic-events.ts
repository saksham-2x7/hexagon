export type SemanticEvent = 
  | { type: 'REPRESENTATION_CHANGED'; representation: 'webgl' | 'node' }
  | { type: 'SCAFFOLD_ADJUSTED'; level: number }
  | { type: 'LEARNER_INPUT'; data: string }
  | { type: 'NODE_CONNECTED'; source: string; target: string }
  | { type: '3D_OBJECT_INTERACTED'; target: string };
