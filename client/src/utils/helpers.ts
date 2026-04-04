import { AttendanceRecord, Difficulty, GradeRecord, SchoolProfile, StudentResult, Subject } from '../types'

export const pct = (score: number, max: number) =>
  max > 0 ? Math.round((score / max) * 100) : 0

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const diffLabel = (difficulty: Difficulty): string => {
  const map: Record<Difficulty, string> = {
    beginner: 'Principiante',
    'beginner+': 'Base avançada',
    intermediate: 'Intermediário',
    hard: 'Avançado',
  }
  return map[difficulty]
}

export const diffClass = (difficulty: Difficulty): string => {
  const map: Record<Difficulty, string> = {
    beginner: 'bg-green-bg text-green border-green-bdr',
    'beginner+': 'bg-green-bg text-green border-green-bdr',
    intermediate: 'bg-gold-bg text-gold border-gold-bdr',
    hard: 'bg-red-bg text-red border-red-bdr',
  }
  return map[difficulty]
}

export function formatDate(value?: string | number | null) {
  if (!value) return '—'
  const date = new Date(value)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(value?: string | number | null) {
  if (!value) return '—'
  const date = new Date(value)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function cn(...tokens: Array<string | false | null | undefined>) {
  return tokens.filter(Boolean).join(' ')
}

export function runCodeTests(
  code: string,
  tests: import('../types').TestCase[],
  functionName = 'gerarResumoIA',
) {
  return tests.map((test) => {
    try {
      const serializedInput =
        typeof test.input === 'string'
          ? JSON.stringify(test.input)
          : `[${test.input.join(',')}]`
      const fn = new Function(`${code}; return ${functionName}(${serializedInput});`)
      const got = fn()
      return { pass: got === test.expected, label: test.label, got }
    } catch (error) {
      return {
        pass: false,
        label: test.label,
        got: `Erro: ${(error as Error).message}`,
      }
    }
  })
}

export function exportCSV(rows: StudentResult[]) {
  if (!rows.length) return false

  const escapeValue = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`

  const header = ['Nome', 'Email', 'Curso', 'Nota', 'Máx', '%', 'Aprovado', 'Data']
  const lines = rows.map((row) => [
    row.name,
    row.email,
    row.course,
    row.score,
    row.max,
    `${pct(row.score, row.max)}%`,
    row.passed ? 'Sim' : 'Não',
    formatDateTime(row.ts),
  ])

  const csv = [header, ...lines].map((line) => line.map(escapeValue).join(';')).join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'painel-escolar-resultados.csv'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
  return true
}

export function averageGradesByStudent(
  profiles: SchoolProfile[],
  grades: GradeRecord[],
  subjects: Subject[],
) {
  const subjectIds = new Set(subjects.map((subject) => subject.id))
  return profiles.map((profile) => {
    const studentGrades = grades.filter(
      (grade) => grade.student_id === profile.id && subjectIds.has(grade.subject_id),
    )
    const average =
      studentGrades.length > 0
        ? studentGrades.reduce((sum, grade) => sum + grade.score, 0) / studentGrades.length
        : 0
    return {
      profile,
      average,
    }
  })
}

export function attendanceSummaryByStudent(profiles: SchoolProfile[], attendance: AttendanceRecord[]) {
  return profiles.map((profile) => {
    const studentAttendance = attendance.filter((record) => record.student_id === profile.id)
    const countedClasses = studentAttendance.filter((record) => record.status !== 'justificada')
    const presence = countedClasses.filter(
      (record) => record.status === 'presente' || record.status === 'atraso',
    ).length
    const pctValue = countedClasses.length > 0 ? Math.round((presence / countedClasses.length) * 100) : 0
    return {
      profile,
      total: countedClasses.length,
      presence,
      pct: pctValue,
    }
  })
}
