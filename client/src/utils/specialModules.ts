import { COURSE_CONTENT } from "../data/courseContent";
import { CourseTrack } from "../types";

export const WINDOW_OPEN = new Date("2026-04-04T13:00:00").getTime();
export const WINDOW_CLOSE = new Date("2026-04-11T17:00:00").getTime();
export const RECOVERY_PASSING_SCORE = 6;
export const RECOVERY_QUESTIONS = {
  "ia-generativa": COURSE_CONTENT["ia-generativa"].recoveryQuestions,
  "ia-soft-skills": COURSE_CONTENT["ia-soft-skills"].recoveryQuestions,
};

export interface StudentProfileSnapshot {
  presencaPct: number;
  coursePct: number;
  projectScore: number;
}

export const DEFAULT_STUDENT_PROFILE: StudentProfileSnapshot = {
  presencaPct: 78,
  coursePct: 72,
  projectScore: 0,
};

export function getWindowStatus(
  userEmail?: string,
): "before" | "open" | "after" {
  const isAdmin = userEmail?.toLowerCase().includes("admin");
  if (isAdmin) return "open";
  const now = Date.now();
  if (now < WINDOW_OPEN) return "before";
  if (now > WINDOW_CLOSE) return "after";
  return "open";
}

export function isWindowOpen(userEmail?: string) {
  return getWindowStatus(userEmail) === "open";
}

export function getStudentProfile(
  _email?: string | null,
): StudentProfileSnapshot {
  return DEFAULT_STUDENT_PROFILE;
}

export function saveStudentProfile(
  _email: string,
  _profile: Partial<StudentProfileSnapshot>,
) {
  return undefined;
}

export function buildAttendanceExplanation(
  currentPct: number,
  challengePct: number,
) {
  const allowedAbsence = 25;
  const finalPct = challengePct;

  return {
    currentPct,
    challengePct,
    finalPct,
    allowedAbsence,
    minPctToPass: 75,
    summary:
      "Para ser aprovado no critério de presença, o aluno precisa fechar com frequência final de pelo menos 75%, o que equivale a no máximo 25% de faltas no período.",
  };
}

export function getRecoveryQuestions(course: CourseTrack) {
  return RECOVERY_QUESTIONS[course];
}
