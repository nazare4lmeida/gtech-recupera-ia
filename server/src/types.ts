export type Difficulty = "beginner" | "beginner+" | "intermediate" | "hard";
export type Category = "prompting" | "ferramentas" | "etica" | "colaboracao";
export type CourseTrack = "ia-generativa" | "ia-soft-skills";

export interface Question {
  id: number;
  order: number;
  difficulty: Difficulty;
  category: Category;
  text: string;
  options: string[];
  correct: number;
  feedbackOk: string;
  feedbackNok: string;
}

export interface CategoryScore {
  c: number;
  t: number;
}

export interface StudentResult {
  id: number;
  name: string;
  email: string;
  course: CourseTrack;
  score: number;
  max: number;
  passed: boolean;
  cats: Record<string, CategoryScore>;
  ts: number;
}

export interface RecoveryResult {
  id: number;
  name: string;
  email: string;
  score: number;
  course: CourseTrack;
  passed: boolean;
  ts: number;
  projectScore?: number;
  bestScore?: number;
}

export interface PresencaResult {
  id: number;
  name: string;
  email: string;
  course: CourseTrack;
  score?: number;
  max?: number;
  passed?: boolean;
  previousPct?: number;
  challengePct?: number;
  presencaPct: number;
  ts: number;
}

export interface PersistedDB {
  results: StudentResult[];
  recoveryResults: RecoveryResult[];
  presencaResults: PresencaResult[];
  questions: Question[];
}

export interface AdminResultRow {
  id: number;
  name: string;
  email: string;
  score: number;
  course?: CourseTrack;
  max: number;
  passed: boolean;
  ts: number;
  module: "ia-generativa" | "ia-soft-skills" | "recuperacao" | "presenca";
  moduleLabel: string;
}
