import { useMemo } from 'react'
import { useApp } from '../hooks/useAppStore'

const stepsByScreen: Record<string, number> = {
  login: 10,
  select: 25,
  admin: 100,
  recuperacao: 75,
  presenca: 80,
  roteiro: 65,
}

export default function ProgressStrip() {
  const { state } = useApp()

  const label = useMemo(() => {
    if (state.screen === 'admin') return 'Painel completo carregado'
    return 'Fluxo acadêmico em andamento'
  }, [state.screen])

  return (
    <div className="border-b border-border/70 bg-white/70">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 md:px-6">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--blue),var(--sky))] transition-all duration-500"
            style={{ width: `${stepsByScreen[state.screen] ?? 0}%` }}
          />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</span>
      </div>
    </div>
  )
}
