import { COURSE_CONTENT } from "../data/courseContent";
import { QUESTIONS } from "../data/seed";
import { encodeValue, restRequest } from "../lib/supabase";
import {
  AdminResultRow,
  AdminStats,
  Assessment,
  AttendanceRecord,
  AttendanceStatus,
  CategoryScore,
  Classroom,
  CourseTrack,
  GradeRecord,
  PresencaResult,
  RecoveryResult,
  SchoolProfile,
  StudentModuleStatusResponse,
  StudentOverview,
  StudentResult,
  Subject,
} from "../types";
import { attendanceSummaryByStudent, averageGradesByStudent } from "./helpers";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

const DEFAULT_ADMIN_EMAILS = (
  import.meta.env.VITE_DEFAULT_ADMIN_EMAILS || "admin@escola.local"
)
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

const DEFAULT_CLASSROOMS: Omit<Classroom, "id" | "created_at">[] = [
  {
    name: "Turma A · Fundamentos",
    course: "ia-generativa",
    shift: "Manhã",
    period_label: "2026.1",
    capacity: 35,
  },
  {
    name: "Turma B · Projetos Colaborativos",
    course: "ia-soft-skills",
    shift: "Noite",
    period_label: "2026.1",
    capacity: 30,
  },
];

const DEFAULT_SUBJECTS: Omit<Subject, "id" | "created_at">[] = [
  {
    name: "Fundamentos de IA Generativa",
    course: "ia-generativa",
    workload_hours: 40,
    teacher_name: "Coordenação Acadêmica",
  },
  {
    name: "Prompt Engineering Aplicado",
    course: "ia-generativa",
    workload_hours: 30,
    teacher_name: "Coordenação Acadêmica",
  },
  {
    name: "Comunicação e Soft Skills com IA",
    course: "ia-soft-skills",
    workload_hours: 32,
    teacher_name: "Coordenação Acadêmica",
  },
  {
    name: "Produtividade Colaborativa",
    course: "ia-soft-skills",
    workload_hours: 28,
    teacher_name: "Coordenação Acadêmica",
  },
];

type CourseSlug = "ia-generativa" | "ia-soft-skills";

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "admin";
  course: CourseTrack;
  classroom_id?: string | null;
  attendance_pct?: number | null;
  course_pct?: number | null;
  project_score?: number | null;
  created_at?: string;
};

type QuizRow = {
  id: string;
  student_email: string;
  student_name: string;
  course: CourseTrack;
  score: number;
  max_score: number;
  passed: boolean;
  category_scores?: Record<string, CategoryScore>;
  ts: number;
};

type RecoveryRow = {
  id: string;
  student_email: string;
  student_name: string;
  course: CourseTrack;
  score: number;
  best_score?: number | null;
  passed: boolean;
  ts: number;
};

type PresenceRow = {
  id: string;
  student_email: string;
  student_name: string;
  course: CourseTrack;
  score: number;
  max_score: number;
  passed: boolean;
  previous_pct: number;
  challenge_pct: number;
  presenca_pct: number;
  prompt_text?: string;
  ts: number;
};

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" && data !== null
        ? (data as { error?: string; message?: string }).error ||
          (data as { error?: string; message?: string }).message ||
          `Falha na requisição à API (${response.status})`
        : `Falha na requisição à API (${response.status})`;

    throw new Error(errorMessage);
  }

  return data as T;
}

function mapProfile(row: ProfileRow): SchoolProfile {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    course: row.course,
    classroom_id: row.classroom_id ?? null,
    attendance_pct: Number(row.attendance_pct ?? 0),
    course_pct: Number(row.course_pct ?? 0),
    project_score: Number(row.project_score ?? 0),
    created_at: row.created_at,
  };
}

function mapQuiz(row: QuizRow): StudentResult {
  return {
    id: row.id,
    name: row.student_name,
    email: row.student_email,
    course: row.course,
    score: Number(row.score),
    max: Number(row.max_score),
    passed: Boolean(row.passed),
    cats: row.category_scores ?? {},
    ts: Number(row.ts),
  };
}

function mapRecovery(row: RecoveryRow): RecoveryResult {
  return {
    id: row.id,
    name: row.student_name,
    email: row.student_email,
    course: row.course,
    score: Number(row.score),
    passed: Boolean(row.passed),
    bestScore: row.best_score ? Number(row.best_score) : undefined,
    ts: Number(row.ts),
  };
}

function mapPresence(row: PresenceRow): PresencaResult {
  return {
    id: row.id,
    name: row.student_name,
    email: row.student_email,
    course: row.course,
    score: Number(row.score),
    max: Number(row.max_score),
    passed: Boolean(row.passed),
    previousPct: Number(row.previous_pct),
    challengePct: Number(row.challenge_pct),
    presencaPct: Number(row.presenca_pct),
    ts: Number(row.ts),
  };
}

function isMissingRelationError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();

  return (
    message.includes("could not find the table") ||
    message.includes("relation") ||
    message.includes("schema cache") ||
    message.includes("school_classrooms") ||
    message.includes("school_subjects")
  );
}

export async function ensureBootstrapData() {
  try {
    const classrooms = await fetchClassrooms();
    if (classrooms.length === 0) {
      await restRequest<Classroom[]>(
        "school_classrooms",
        "POST",
        DEFAULT_CLASSROOMS,
        { Prefer: "return=representation" },
      );
    }

    const subjects = await fetchSubjects();
    if (subjects.length === 0) {
      await restRequest<Subject[]>(
        "school_subjects",
        "POST",
        DEFAULT_SUBJECTS,
        { Prefer: "return=representation" },
      );
    }
  } catch (error) {
    if (!isMissingRelationError(error)) {
      throw error;
    }

    console.warn(
      "Bootstrap ignorado porque as tabelas acadêmicas ainda não existem no Supabase:",
      error,
    );
  }

  for (const email of DEFAULT_ADMIN_EMAILS) {
    await restRequest<ProfileRow[]>(
      "school_profiles?on_conflict=email",
      "POST",
      [
        {
          full_name: "Administrador do sistema",
          email,
          role: "admin",
          course: "ia-generativa",
          attendance_pct: 100,
          course_pct: 100,
          project_score: 0,
        },
      ],
      {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
    );
  }
}

export const fetchQuestions = async () => QUESTIONS;
export const updateQuestion = async (
  id: number,
  data: Partial<(typeof QUESTIONS)[number]>,
) => {
  const current = QUESTIONS.find((question) => question.id === id);
  return { ...current, ...data };
};

export async function upsertProfile(input: {
  full_name: string;
  email: string;
  role: "student" | "admin";
  course: CourseTrack;
  classroom_id?: string | null;
}) {
  const rows = await restRequest<ProfileRow[]>(
    "school_profiles?on_conflict=email",
    "POST",
    [
      {
        ...input,
        email: input.email.toLowerCase(),
      },
    ],
    {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
  );

  return mapProfile(rows[0]);
}

export async function validateAdminAccess(data: {
  email: string;
  adminCode?: string;
}) {
  return apiRequest<{ ok: boolean }>("/admin-auth", {
    method: "POST",
    body: JSON.stringify({
      email: data.email.trim().toLowerCase(),
      adminCode: String(data.adminCode ?? "").trim(),
    }),
  });
}

export async function fetchStudentProfile(email: string) {
  const rows = await restRequest<ProfileRow[]>(
    `school_profiles?select=*&email=eq.${encodeValue(email.toLowerCase())}&limit=1`,
    "GET",
  );
  return rows[0] ? mapProfile(rows[0]) : null;
}

export async function fetchClassrooms() {
  return restRequest<Classroom[]>(
    "school_classrooms?select=*&order=name.asc",
    "GET",
  );
}

export async function saveClassroom(payload: Omit<Classroom, "created_at">) {
  const isUpdate = Boolean(payload.id);
  const body = {
    name: payload.name,
    course: payload.course,
    shift: payload.shift,
    period_label: payload.period_label,
    capacity: payload.capacity,
  };

  const rows = isUpdate
    ? await restRequest<Classroom[]>(
        `school_classrooms?id=eq.${encodeValue(payload.id)}`,
        "PATCH",
        body,
        { Prefer: "return=representation" },
      )
    : await restRequest<Classroom[]>("school_classrooms", "POST", body, {
        Prefer: "return=representation",
      });

  return rows[0];
}

export async function deleteClassroom(id: string) {
  await restRequest<null>(
    `school_classrooms?id=eq.${encodeValue(id)}`,
    "DELETE",
  );
}

export async function fetchSubjects() {
  return restRequest<Subject[]>(
    "school_subjects?select=*&order=name.asc",
    "GET",
  );
}

export async function saveSubject(payload: Omit<Subject, "created_at">) {
  const isUpdate = Boolean(payload.id);
  const body = {
    name: payload.name,
    course: payload.course,
    workload_hours: payload.workload_hours,
    teacher_name: payload.teacher_name,
    classroom_id: payload.classroom_id ?? null,
  };

  const rows = isUpdate
    ? await restRequest<Subject[]>(
        `school_subjects?id=eq.${encodeValue(payload.id)}`,
        "PATCH",
        body,
        { Prefer: "return=representation" },
      )
    : await restRequest<Subject[]>("school_subjects", "POST", body, {
        Prefer: "return=representation",
      });

  return rows[0];
}

export async function deleteSubject(id: string) {
  await restRequest<null>(`school_subjects?id=eq.${encodeValue(id)}`, "DELETE");
}

export async function fetchProfiles(role?: "student" | "admin") {
  const base = "school_profiles?select=*";
  const query = role
    ? `${base}&role=eq.${encodeValue(role)}&order=full_name.asc`
    : `${base}&order=full_name.asc`;
  const rows = await restRequest<ProfileRow[]>(query, "GET");
  return rows.map(mapProfile);
}

export async function saveProfile(payload: {
  id?: string;
  full_name: string;
  email: string;
  role: "student" | "admin";
  course: CourseTrack;
  classroom_id?: string | null;
  attendance_pct?: number;
  course_pct?: number;
  project_score?: number;
}) {
  const body = {
    full_name: payload.full_name,
    email: payload.email.toLowerCase(),
    role: payload.role,
    course: payload.course,
    classroom_id: payload.classroom_id ?? null,
    attendance_pct: payload.attendance_pct ?? 0,
    course_pct: payload.course_pct ?? 0,
    project_score: payload.project_score ?? 0,
  };

  const rows = payload.id
    ? await restRequest<ProfileRow[]>(
        `school_profiles?id=eq.${encodeValue(payload.id)}`,
        "PATCH",
        body,
        { Prefer: "return=representation" },
      )
    : await restRequest<ProfileRow[]>(
        "school_profiles?on_conflict=email",
        "POST",
        [body],
        {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
      );

  return mapProfile(rows[0]);
}

export async function deleteProfile(id: string) {
  await restRequest<null>(`school_profiles?id=eq.${encodeValue(id)}`, "DELETE");
}

export async function fetchAssessments() {
  return restRequest<Assessment[]>(
    "school_assessments?select=*&order=created_at.desc",
    "GET",
  );
}

export async function fetchGrades() {
  return restRequest<GradeRecord[]>(
    "school_grade_records?select=*&order=created_at.desc",
    "GET",
  );
}

export async function saveGradeEntry(input: {
  studentId: string;
  subjectId: string;
  classroomId?: string | null;
  title: string;
  assessmentType: "regular" | "recovery";
  score: number;
  maxScore: number;
  weight: number;
  notes?: string;
  dueDate?: string | null;
}) {
  const assessmentRows = await restRequest<Assessment[]>(
    "school_assessments",
    "POST",
    {
      title: input.title,
      assessment_type: input.assessmentType,
      subject_id: input.subjectId,
      classroom_id: input.classroomId ?? null,
      max_score: input.maxScore,
      weight: input.weight,
      due_date: input.dueDate ?? null,
    },
    { Prefer: "return=representation" },
  );

  const assessment = assessmentRows[0];

  const gradeRows = await restRequest<GradeRecord[]>(
    "school_grade_records",
    "POST",
    {
      student_id: input.studentId,
      subject_id: input.subjectId,
      assessment_id: assessment.id,
      score: input.score,
      notes: input.notes ?? null,
    },
    { Prefer: "return=representation" },
  );

  return {
    assessment,
    grade: gradeRows[0],
  };
}

export async function deleteGrade(id: string) {
  await restRequest<null>(
    `school_grade_records?id=eq.${encodeValue(id)}`,
    "DELETE",
  );
}

export async function fetchAttendance() {
  return restRequest<AttendanceRecord[]>(
    "school_attendance_records?select=*&order=class_date.desc",
    "GET",
  );
}

export async function saveAttendanceEntry(input: {
  studentId: string;
  subjectId: string;
  classDate: string;
  status: AttendanceStatus;
}) {
  const rows = await restRequest<AttendanceRecord[]>(
    "school_attendance_records",
    "POST",
    {
      student_id: input.studentId,
      subject_id: input.subjectId,
      class_date: input.classDate,
      status: input.status,
    },
    { Prefer: "return=representation" },
  );

  return rows[0];
}

export async function deleteAttendance(id: string) {
  await restRequest<null>(
    `school_attendance_records?id=eq.${encodeValue(id)}`,
    "DELETE",
  );
}

export async function fetchResults(course?: CourseSlug) {
  const filter = course ? `&course=eq.${encodeValue(course)}` : "";
  const rows = await restRequest<QuizRow[]>(
    `school_quiz_results?select=*&order=ts.desc${filter}`,
    "GET",
  );
  return rows.map(mapQuiz);
}

export async function fetchLatestQuizResult(
  email: string,
  course: CourseTrack,
) {
  const rows = await restRequest<QuizRow[]>(
    `school_quiz_results?select=*&student_email=eq.${encodeValue(email.toLowerCase())}&course=eq.${encodeValue(course)}&order=ts.desc&limit=1`,
    "GET",
  );
  return rows[0] ? mapQuiz(rows[0]) : null;
}

export async function postResult(
  result: Omit<StudentResult, "id" | "ts"> & { course: CourseSlug },
) {
  const rows = await restRequest<QuizRow[]>(
    "school_quiz_results",
    "POST",
    {
      student_name: result.name,
      student_email: result.email.toLowerCase(),
      course: result.course,
      score: result.score,
      max_score: result.max,
      passed: result.passed,
      category_scores: result.cats,
      ts: Date.now(),
    },
    { Prefer: "return=representation" },
  );

  return mapQuiz(rows[0]);
}

export async function deleteAllResults() {
  await restRequest<null>("school_quiz_results?id=not.is.null", "DELETE");
  return { ok: true };
}

export async function deleteResult(id: string) {
  await restRequest<null>(
    `school_quiz_results?id=eq.${encodeValue(id)}`,
    "DELETE",
  );
  return { ok: true };
}

export async function fetchRecoveryResults(course?: CourseSlug) {
  const filter = course ? `&course=eq.${encodeValue(course)}` : "";
  const rows = await restRequest<RecoveryRow[]>(
    `school_recovery_results?select=*&order=ts.desc${filter}`,
    "GET",
  );
  return rows.map(mapRecovery);
}

export async function postRecoveryResult(data: {
  name: string;
  email: string;
  course: CourseSlug;
  score: number;
  passed: boolean;
}) {
  const rows = await restRequest<RecoveryRow[]>(
    "school_recovery_results?on_conflict=student_email,course",
    "POST",
    [
      {
        student_name: data.name,
        student_email: data.email.toLowerCase(),
        course: data.course,
        score: data.score,
        best_score: data.score,
        passed: data.passed,
        ts: Date.now(),
      },
    ],
    {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
  );

  return mapRecovery(rows[0]);
}

export async function deleteRecoveryResult(id: string) {
  await restRequest<null>(
    `school_recovery_results?id=eq.${encodeValue(id)}`,
    "DELETE",
  );
  return { ok: true };
}

export async function fetchPresencaResults(course?: CourseSlug) {
  const filter = course ? `&course=eq.${encodeValue(course)}` : "";
  const rows = await restRequest<PresenceRow[]>(
    `school_presence_results?select=*&order=ts.desc${filter}`,
    "GET",
  );
  return rows.map(mapPresence);
}

export async function postPresencaResult(data: {
  name: string;
  email: string;
  course: CourseSlug;
  score: number;
  max: number;
  passed: boolean;
  presencaPct: number;
  previousPct?: number;
  challengePct?: number;
  promptText: string;
}) {
  const rows = await restRequest<PresenceRow[]>(
    "school_presence_results?on_conflict=student_email,course",
    "POST",
    [
      {
        student_name: data.name,
        student_email: data.email.toLowerCase(),
        course: data.course,
        score: data.score,
        max_score: data.max,
        passed: data.passed,
        previous_pct: data.previousPct ?? 0,
        challenge_pct: data.challengePct ?? 0,
        presenca_pct: data.presencaPct,
        prompt_text: data.promptText,
        ts: Date.now(),
      },
    ],
    {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
  );

  return mapPresence(rows[0]);
}

export async function deletePresencaResult(id: string) {
  await restRequest<null>(
    `school_presence_results?id=eq.${encodeValue(id)}`,
    "DELETE",
  );
  return { ok: true };
}

export async function fetchStudentOverview(
  email: string,
  course: CourseTrack,
): Promise<StudentOverview | null> {
  const profile = await fetchStudentProfile(email);
  if (!profile) return null;

  const [quiz, recovery, presence] = await Promise.all([
    fetchLatestQuizResult(email, course),
    fetchRecoveryResults(course).then(
      (items) =>
        items.find((item) => item.email === email.toLowerCase()) ?? null,
    ),
    fetchPresencaResults(course).then(
      (items) =>
        items.find((item) => item.email === email.toLowerCase()) ?? null,
    ),
  ]);

  return {
    profile,
    quizResult: quiz,
    recoveryResult: recovery,
    presenceResult: presence,
  };
}

export async function fetchStudentStatus(
  email: string,
  course: CourseSlug,
): Promise<StudentModuleStatusResponse> {
  const [recoveryResults, presenceResults] = await Promise.all([
    fetchRecoveryResults(course),
    fetchPresencaResults(course),
  ]);

  const normalizedEmail = email.trim().toLowerCase();
  const recovery = recoveryResults.find(
    (item) => item.email === normalizedEmail,
  );
  const challenge = presenceResults.find(
    (item) => item.email === normalizedEmail,
  );

  return {
    recovery: {
      status: recovery ? "completed" : "not_started",
      canStart: !recovery,
      completedAt: recovery?.ts ?? null,
      attemptCount: recovery ? 1 : 0,
    },
    challenge: {
      status: challenge ? "completed" : "not_started",
      canStart: !challenge,
      completedAt: challenge?.ts ?? null,
      attemptCount: challenge ? 1 : 0,
    },
  };
}

export async function fetchAdminResults() {
  const [quiz, recovery, presence] = await Promise.all([
    fetchResults(),
    fetchRecoveryResults(),
    fetchPresencaResults(),
  ]);

  const mainRows: AdminResultRow[] = quiz.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    course: item.course,
    score: item.score,
    max: item.max,
    passed: item.passed,
    ts: item.ts,
    module: item.course,
    moduleLabel:
      item.course === "ia-generativa"
        ? "Quiz · IA Generativa"
        : "Quiz · IA + Soft Skills",
  }));

  const recoveryRows: AdminResultRow[] = recovery.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    course: item.course,
    score: item.bestScore ?? item.score,
    max: COURSE_CONTENT[item.course].recoveryQuestions.length,
    passed: item.passed,
    ts: item.ts,
    module: "recuperacao",
    moduleLabel:
      item.course === "ia-generativa"
        ? "Recuperação · IA Generativa"
        : "Recuperação · IA + Soft Skills",
  }));

  const presenceRows: AdminResultRow[] = presence.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    course: item.course,
    score: item.score ?? 0,
    max: item.max ?? 0,
    passed: item.passed ?? false,
    ts: item.ts,
    module: "presenca",
    moduleLabel:
      item.course === "ia-generativa"
        ? "Desafio de presença · IA Generativa"
        : "Desafio de presença · IA + Soft Skills",
  }));

  return [...mainRows, ...recoveryRows, ...presenceRows].sort(
    (a, b) => b.ts - a.ts,
  );
}

export async function deleteAdminResults(
  rows: Array<Pick<AdminResultRow, "id" | "module">>,
) {
  await Promise.all(
    rows.map((row) => {
      if (row.module === "recuperacao") return deleteRecoveryResult(row.id);
      if (row.module === "presenca") return deletePresencaResult(row.id);
      return deleteResult(row.id);
    }),
  );

  return { ok: true };
}

export async function fetchStats(): Promise<AdminStats> {
  const [
    profiles,
    classrooms,
    subjects,
    assessments,
    grades,
    attendance,
    results,
    recovery,
    presence,
  ] = await Promise.all([
    fetchProfiles("student"),
    fetchClassrooms(),
    fetchSubjects(),
    fetchAssessments(),
    fetchGrades(),
    fetchAttendance(),
    fetchResults(),
    fetchRecoveryResults(),
    fetchPresencaResults(),
  ]);

  const gradeAverages = averageGradesByStudent(profiles, grades, subjects);
  const attendanceSummary = attendanceSummaryByStudent(profiles, attendance);
  const gradeAverage =
    gradeAverages.length > 0
      ? Number(
          (
            gradeAverages.reduce((sum, item) => sum + item.average, 0) /
            gradeAverages.length
          ).toFixed(1),
        )
      : 0;
  const attendanceAverage =
    attendanceSummary.length > 0
      ? Math.round(
          attendanceSummary.reduce((sum, item) => sum + item.pct, 0) /
            attendanceSummary.length,
        )
      : 0;
  const approvalBase = [...results, ...recovery, ...presence];
  const approvalRate =
    approvalBase.length > 0
      ? Math.round(
          (approvalBase.filter((item) => item.passed).length /
            approvalBase.length) *
            100,
        )
      : 0;
  const riskCount = profiles.filter((profile) => {
    const attendancePct =
      attendanceSummary.find((item) => item.profile.id === profile.id)?.pct ??
      profile.attendance_pct;
    const gradePct = Math.round(
      gradeAverages.find((item) => item.profile.id === profile.id)?.average ??
        profile.course_pct,
    );
    return attendancePct < 75 || gradePct < 60;
  }).length;

  return {
    totalStudents: profiles.length,
    totalClasses: classrooms.length,
    totalSubjects: subjects.length,
    totalAssessments: assessments.length,
    attendanceAverage,
    gradeAverage,
    approvalRate,
    riskCount,
    quizCount: results.length,
    recoveryCount: recovery.length,
    presenceCount: presence.length,
  };
}

export async function fetchAdminSnapshot() {
  const [
    profiles,
    classrooms,
    subjects,
    assessments,
    grades,
    attendance,
    results,
  ] = await Promise.all([
    fetchProfiles("student"),
    fetchClassrooms(),
    fetchSubjects(),
    fetchAssessments(),
    fetchGrades(),
    fetchAttendance(),
    fetchAdminResults(),
  ]);

  return {
    profiles,
    classrooms,
    subjects,
    assessments,
    grades,
    attendance,
    results,
  };
}
