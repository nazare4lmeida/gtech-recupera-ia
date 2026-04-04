import { useEffect, useMemo, useState } from 'react'
import { COURSE_CONTENT } from '../../data/courseContent'
import { RECOVERY_PASSING_SCORE } from '../../data/recoveryQuestions'
import { useApp } from '../../hooks/useAppStore'
import { fetchStudentStatus, postRecoveryResult } from '../../utils/api'

export default function ProvaRecuperacao() {
  const { navigate, state } = useApp()
  const course = state.user?.course ?? 'ia-generativa'
  const questions = COURSE_CONTENT[course].recoveryQuestions
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)

  useEffect(() => {
    async function checkStatus() {
      if (!state.user) return
      const status = await fetchStudentStatus(state.user.email, state.user.course)
      setAlreadyCompleted(status.recovery.status === 'completed')
    }

    void checkStatus()
  }, [state.user])

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])
  const canSubmit = answeredCount === questions.length && !saving

  if (!state.user) return null

  const handleSubmit = async () => {
    if (!state.user) return
    const total = questions.reduce((sum, question) => sum + (answers[question.id] === question.correct ? 1 : 0), 0)
    setScore(total)
    setSaving(true)
    try {
      await postRecoveryResult({
        name: state.user.name,
        email: state.user.email,
        course: state.user.course,
        score: total,
        passed: total >= RECOVERY_PASSING_SCORE,
      })
      setSubmitted(true)
    } finally {
      setSaving(false)
    }
  }

  if (alreadyCompleted && !submitted) {
    return (
      <div className="w-full max-w-3xl animate-fade-up px-4 py-8 md:px-6">
        <div className="surface-panel p-8">
          <h2 className="text-3xl font-semibold text-text">Recuperação já concluída</h2>
          <p className="mt-3 text-muted">Este aluno já possui um resultado salvo para a prova de recuperação nesta trilha.</p>
          <button type="button" className="primary-btn mt-6" onClick={() => navigate('select')}>
            Voltar ao portal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl animate-fade-up px-4 py-8 md:px-6">
      <div className="surface-panel p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="eyebrow">Recuperação acadêmica</span>
            <h2 className="mt-2 text-3xl font-semibold text-text">Prova de recuperação · {course === 'ia-generativa' ? 'IA Generativa' : 'IA + Soft Skills'}</h2>
            <p className="mt-3 max-w-3xl text-muted">
              Esta avaliação usa regras próprias de recuperação. Por isso, qualquer campo ou resumo de <strong>nota parcial</strong> foi removido completamente da interface. Aqui você vê apenas progresso de respostas preenchidas e resultado final após o envio.
            </p>
          </div>
          <div className="rounded-card border border-border bg-bg px-4 py-3 text-sm text-muted">
            Respostas preenchidas: <strong className="text-text">{answeredCount}/{questions.length}</strong>
          </div>
        </div>

        {submitted ? (
          <div className="mt-8 rounded-card border border-border bg-bg p-6 animate-scale-in">
            <h3 className="text-2xl font-semibold text-text">Resultado enviado</h3>
            <p className="mt-3 text-muted">
              Você acertou <strong>{score}</strong> de <strong>{questions.length}</strong> questões. Critério mínimo para aprovação: <strong> 6 acertos</strong>.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="primary-btn" onClick={() => navigate('select')}>
                Voltar ao portal
              </button>
              <button type="button" className="secondary-btn" onClick={() => navigate('roteiro')}>
                Revisar roteiro
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-5">
              {questions.map((question, index) => {
                const selected = answers[question.id]
                return (
                  <article key={question.id} className="rounded-card border border-border bg-bg p-5 shadow-card">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <span className="status-pill">Questão {index + 1}</span>
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted">{question.category}</span>
                    </div>
                    <p className="text-lg font-bold leading-8 text-text">{question.text}</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                          className={`rounded-card border px-4 py-3 text-left transition ${
                            selected === optionIndex
                              ? 'border-blue bg-sky/30 text-text shadow-card'
                              : 'border-border bg-surface text-text hover:border-blue hover:shadow-card'
                          }`}
                        >
                          <strong className="mr-2">{String.fromCharCode(65 + optionIndex)}.</strong>
                          {option}
                        </button>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" disabled={!canSubmit} className="primary-btn" onClick={() => void handleSubmit()}>
                {saving ? 'Enviando...' : 'Enviar prova'}
              </button>
              <button type="button" className="secondary-btn" onClick={() => navigate('select')}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
