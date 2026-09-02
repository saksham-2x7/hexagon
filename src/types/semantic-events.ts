export type SemanticEvent = 
  | { type: 'REPRESENTATION_CHANGED'; representation: 'webgl' | 'node' }
  | { type: 'SCAFFOLD_ADJUSTED'; level: number }
  | { type: 'LEARNER_INPUT'; data: string };
