export type Screen =
  | 'login'
  | 'select'
  | 'challenge'
  | 'result'
  | 'admin'
  | 'recuperacao'
  | 'presenca'
  | 'roteiro'

export type CourseTrack = 'ia-generativa' | 'ia-soft-skills'
export type Layout = 1 | 2 | 3
export type Difficulty = 'beginner' | 'beginner+' | 'intermediate' | 'hard'
export type Category = 'prompting' | 'ferramentas' | 'etica' | 'colaboracao'
export type Role = 'student' | 'admin'
export type AdminTab =
  | 'dashboard'
  | 'students'
  | 'classes'
  | 'subjects'
  | 'gradebook'
  | 'attendance'
  | 'results'

export interface User {
  id?: string
  name: string
  email: string
  course: CourseTrack
  role: Role
  classroomId?: string | null
}

export interface Question {
  id: number
  order: number
  difficulty: Difficulty
  category: Category
  text: string
  options: string[]
  correct: number
  feedbackOk: string
  feedbackNok: string
}

export interface RecoveryQuestion {
  id: number
  category: 'Prompting' | 'Modelos' | 'Ferramentas' | 'Ética' | 'Soft Skills'
  text: string
  options: string[]
  correct: number
  explanation: string
}

export interface TestCase {
  input: string | number[]
  expected: number | string
  label: string
}

export interface CodeChallenge {
  statement: string
  functionName: string
  tests: TestCase[]
}

export interface Challenge {
  id: number
  title: string
  desc: string
  layout: Layout
  active: boolean
}

export interface PromptChallengeDefinition {
  id: string
  course: CourseTrack
  title: string
  intro: string
  scenario: string
  instructions: string[]
  requiredItems: string[]
  bonusItems?: string[]
  minimumRequiredToPass: number
  placeholder: string
}

export interface CategoryScore {
  c: number
  t: number
}

export interface Answer {
  qid: number
  sel?: number
  correct: boolean
  category: Category
  codeResults?: CodeTestResult[]
}

export interface CodeTestResult {
  pass: boolean
  label: string
  got: number | string
}

export interface StudentResult {
  id: string
  name: string
  email: string
  course: CourseTrack
  score: number
  max: number
  passed: boolean
  cats: Record<string, CategoryScore>
  ts: number
}

export interface RecoveryResult {
  id: string
  name: string
  email: string
  course: CourseTrack
  score: number
  passed: boolean
  ts: number
  bestScore?: number
}

export interface PresencaResult {
  id: string
  name: string
  email: string
  course: CourseTrack
  score?: number
  max?: number
  passed?: boolean
  previousPct?: number
  challengePct?: number
  presencaPct: number
  ts: number
}

export interface StudentModuleStatusItem {
  status: 'not_started' | 'in_progress' | 'completed'
  canStart: boolean
  completedAt?: number | null
  attemptCount: number
}

export interface StudentModuleStatusResponse {
  recovery: StudentModuleStatusItem
  challenge: StudentModuleStatusItem
}

export interface SchoolProfile {
  id: string
  full_name: string
  email: string
  role: Role
  course: CourseTrack
  classroom_id?: string | null
  attendance_pct: number
  course_pct: number
  project_score: number
  created_at?: string
}

export interface Classroom {
  id: string
  name: string
  course: CourseTrack
  shift: 'Manhã' | 'Tarde' | 'Noite'
  period_label: string
  capacity: number
  created_at?: string
}

export interface Subject {
  id: string
  name: string
  course: CourseTrack
  workload_hours: number
  teacher_name: string
  classroom_id?: string | null
  created_at?: string
}

export type AssessmentType = 'regular' | 'recovery'

export interface Assessment {
  id: string
  title: string
  assessment_type: AssessmentType
  subject_id: string
  classroom_id?: string | null
  max_score: number
  weight: number
  due_date?: string | null
  created_at?: string
}

export interface GradeRecord {
  id: string
  student_id: string
  subject_id: string
  assessment_id: string
  score: number
  notes?: string | null
  created_at?: string
}

export type AttendanceStatus = 'presente' | 'falta' | 'atraso' | 'justificada'

export interface AttendanceRecord {
  id: string
  student_id: string
  subject_id: string
  status: AttendanceStatus
  class_date: string
  created_at?: string
}

export interface AdminResultRow {
  id: string
  name: string
  email: string
  course: CourseTrack
  score: number
  max: number
  passed: boolean
  ts: number
  module: 'ia-generativa' | 'ia-soft-skills' | 'recuperacao' | 'presenca'
  moduleLabel: string
}

export interface AdminStats {
  totalStudents: number
  totalClasses: number
  totalSubjects: number
  totalAssessments: number
  attendanceAverage: number
  gradeAverage: number
  approvalRate: number
  riskCount: number
  quizCount: number
  recoveryCount: number
  presenceCount: number
}

export interface StudentOverview {
  profile: SchoolProfile
  quizResult?: StudentResult | null
  recoveryResult?: RecoveryResult | null
  presenceResult?: PresencaResult | null
}

export interface AppState {
  screen: Screen
  user: User | null
  challengeId: number | null
  layout: Layout
  currentQ: number
  answers: Answer[]
  score: number
  codeScore: number
  adminTab: AdminTab
  latestQuizResult?: StudentResult | null
}

export interface ToastItem {
  id: string
  tone: 'info' | 'success' | 'error'
  message: string
}
