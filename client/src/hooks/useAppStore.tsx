import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_APPROVAL_THRESHOLD } from '../data/seed'
import { ensureBootstrapData, fetchResults, postResult } from '../utils/api'
import { AppState, Answer, CategoryScore, CourseTrack, Layout, Screen, User } from '../types'

type AdminTab = AppState['adminTab']

interface AppCtx {
  state: AppState
  approvalThreshold: number
  selectedCourse: CourseTrack | null
  bootstrapReady: boolean
  setState: (partial: Partial<AppState>) => void
  setSelectedCourse: (course: CourseTrack | null) => void
  navigate: (screen: Screen) => void
  login: (user: User) => Promise<void>
  logout: () => void
  startChallenge: (id: number, layout: Layout) => void
  addAnswer: (answer: Answer) => void
  addScore: (value: number) => void
  finalizeQuiz: () => Promise<void>
  setAdminTab: (tab: AdminTab) => void
  resetQuizFlow: () => void
}

const initialState: AppState = {
  screen: 'login',
  user: null,
  challengeId: null,
  layout: 1,
  currentQ: 0,
  answers: [],
  score: 0,
  codeScore: 0,
  adminTab: 'dashboard',
  latestQuizResult: null,
}

const Ctx = createContext<AppCtx | null>(null)

export const useApp = () => {
  const context = useContext(Ctx)
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider')
  return context
}

function buildCategorySummary(answers: Answer[]) {
  return answers.reduce<Record<string, CategoryScore>>((acc, answer) => {
    const current = acc[answer.category] ?? { c: 0, t: 0 }
    current.t += 1
    if (answer.correct) current.c += 1
    acc[answer.category] = current
    return acc
  }, {})
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setInternalState] = useState<AppState>(initialState)
  const [selectedCourse, setSelectedCourseState] = useState<CourseTrack | null>(null)
  const [bootstrapReady, setBootstrapReady] = useState(false)

  useEffect(() => {
    ensureBootstrapData()
      .catch((error) => {
        console.error('Falha ao preparar dados iniciais do Supabase:', error)
      })
      .finally(() => setBootstrapReady(true))
  }, [])

  const setState = useCallback((partial: Partial<AppState>) => {
    setInternalState((previous) => ({ ...previous, ...partial }))
  }, [])

  const setSelectedCourse = useCallback((course: CourseTrack | null) => {
    setSelectedCourseState(course)
  }, [])

  const navigate = useCallback((screen: Screen) => {
    setState({ screen })
  }, [setState])

  const setAdminTab = useCallback((tab: AdminTab) => {
    setState({ adminTab: tab })
  }, [setState])

  const login = useCallback(async (user: User) => {
    setSelectedCourseState(user.course)

    setInternalState((previous) => ({
      ...previous,
      user,
      screen: user.role === 'admin' ? 'admin' : 'select',
      adminTab: 'dashboard',
    }))
  }, [])

  const logout = useCallback(() => {
    setSelectedCourseState(null)
    setInternalState(initialState)
  }, [])

  const startChallenge = useCallback((id: number, layout: Layout) => {
    setState({
      challengeId: id,
      layout,
      currentQ: 0,
      answers: [],
      score: 0,
      codeScore: 0,
      latestQuizResult: null,
      screen: 'challenge',
    })
  }, [setState])

  const addAnswer = useCallback((answer: Answer) => {
    setInternalState((previous) => ({
      ...previous,
      answers: [...previous.answers, answer],
      currentQ: previous.currentQ + 1,
    }))
  }, [])

  const addScore = useCallback((value: number) => {
    setInternalState((previous) => ({
      ...previous,
      score: previous.score + value,
    }))
  }, [])

  const finalizeQuiz = useCallback(async () => {
    if (!state.user) return

    const categorySummary = buildCategorySummary(state.answers)
    const max = Math.max(state.answers.length, 1)

    const result = await postResult({
      name: state.user.name,
      email: state.user.email,
      course: state.user.course,
      score: state.score,
      max,
      passed: Math.round((state.score / max) * 100) >= DEFAULT_APPROVAL_THRESHOLD,
      cats: categorySummary,
    })

    await fetchResults(state.user.course)

    // ✅ SALVA TAMBÉM NO USER
    setInternalState((previous) => ({
      ...previous,
      latestQuizResult: result,
      user: {
        ...previous.user!,
        quizResult: result,
      },
      screen: 'result',
    }))
  }, [state.answers, state.score, state.user])

  const resetQuizFlow = useCallback(() => {
    setState({
      challengeId: null,
      currentQ: 0,
      answers: [],
      score: 0,
      codeScore: 0,
      // ❌ NÃO LIMPA MAIS O RESULTADO
    })
  }, [setState])

  const value = useMemo<AppCtx>(() => ({
    state,
    approvalThreshold: DEFAULT_APPROVAL_THRESHOLD,
    selectedCourse,
    bootstrapReady,
    setState,
    setSelectedCourse,
    navigate,
    login,
    logout,
    startChallenge,
    addAnswer,
    addScore,
    finalizeQuiz,
    setAdminTab,
    resetQuizFlow,
  }), [
    state,
    selectedCourse,
    bootstrapReady,
    setState,
    setSelectedCourse,
    navigate,
    login,
    logout,
    addAnswer,
    addScore,
    finalizeQuiz,
    setAdminTab,
    resetQuizFlow,
  ])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}