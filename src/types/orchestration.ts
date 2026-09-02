export type RepresentationId = 'webgl' | 'node' | 'graph' | 'timeline' | 'diagram' | 'manipulation' | 'text';

export type AIIntentState = {
  activeRepresentation: RepresentationId;
  scaffoldLevel: number;
  schemaData: unknown;
  focusTargetId?: string;
  lessonPhase?: 'Explain' | 'Hypothesize' | 'Construct' | 'Observe' | 'Resolve' | 'Question' | 'Evaluate';
};

export type RepresentationMetadata = {
  id: RepresentationId;
  name: string;
  description: string;
  capabilities: string[];
};
