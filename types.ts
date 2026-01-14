
export enum Subject {
  MATH = "Mathématiques",
  PHYSICS = "Physique",
  CHEMISTRY = "Chimie",
  SVT = "SVT",
  PHILOSOPHY = "Philosophie",
  OTHER = "Autre"
}

export enum EducationLevel {
  COMMON_CORE = "Tronc Commun",
  FIRST_BAC = "1ère Bac",
  SECOND_BAC = "2ème Bac"
}

export enum SolveMode {
  FAST_EXAM = "FAST_EXAM",
  DETAILED_STUDY = "DETAILED_STUDY"
}

export interface QuestionAnswer {
  number: string;
  text: string;
  status: "solved" | "unreadable" | "partial"; 
  examAnswer: string;
}

export interface ExerciseSolution {
  originalText: string;
  subject: Subject;
  level: EducationLevel;
  language: "ar" | "fr";
  mainIdea: string;
  questions: QuestionAnswer[];
  verificationStatus: string;
  totalQuestionsFound: number;
  allSolved: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  image: string;
  solution: ExerciseSolution;
}

export interface AppTheme {
  primary: string;
  surface: string;
  container: string;
  name: string;
}

export interface AppState {
  image: string | null;
  loading: boolean;
  solution: ExerciseSolution | null;
  error: string | null;
  mode: SolveMode;
  history: HistoryItem[];
  theme: AppTheme;
  activeTab: 'solve' | 'history' | 'settings';
  isDarkMode: boolean;
}
