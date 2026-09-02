export type LearnerProfile = {
  topic: string;
  hasMaterials: boolean;
  depthLevel: number;
  learningStyle: 'visual' | 'kinesthetic' | 'auditory' | 'reading';
};
