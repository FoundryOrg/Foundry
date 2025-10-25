export interface Course {
  id: string;
  name: string;
  learningObjectives: string[];
  modules: Module[];
  finalAssessment: FinalAssessment;
  createdAt: string;
}

export interface SubModule {
  id: string;
  title: string;
  content: {
    text: string;
    aiGeneratedImage: string;
  };
}

export interface Module {
  id: string;
  title: string;
  subModules: SubModule[];
  quiz: Quiz;
  isSafetyCheck?: boolean;
}

export interface Quiz {
  id: string;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface FinalAssessment {
  title: string;
  description: string;
  arInstructions: string[];
  metaRayBansIntegration: boolean;
}

export type ActiveView = 'overview' | 'module' | 'submodule' | 'quiz' | 'assessment';

export interface LoadingStep {
  id: number;
  text: string;
  duration: number;
}
