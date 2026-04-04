import { useMemo } from "react";
import { useApp } from "../hooks/useAppStore";
import { initials } from "../utils/helpers";

const screenTitles: Record<string, string> = {
  login: "Acesso ao sistema",
  select: "Portal do aluno",
  challenge: "Avaliação diagnóstica",
  result: "Resultado da trilha",
  admin: "Painel administrativo",
  recuperacao: "Prova de recuperação",
  presenca: "Desafio de presença",
  roteiro: "Guia de estudos",
};

export default function Header() {
  const { state, logout, navigate } = useApp();

  const subtitle = useMemo(() => {
    if (!state.user) return "Sistema Geração Tech de Recuperação";
    return state.user.role === "admin"
      ? "Gestão acadêmica centralizada: alunos, turmas, disciplinas, notas e frequência."
      : `Aluno conectado · ${state.user.course === "ia-generativa" ? "IA Generativa" : "IA + Soft Skills"}`;
  }, [state.user]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              navigate(
                state.user?.role === "admin"
                  ? "admin"
                  : state.user
                    ? "select"
                    : "login",
              )
            }
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-[linear-gradient(180deg,var(--navy),var(--blue))] text-white shadow-card transition hover:-translate-y-0.5"
          >
            GT
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue">
              Geração Tech · Recupera IA
            </p>
            <h1 className="text-[1.1rem] font-semibold text-text md:text-[1.35rem]">
              {screenTitles[state.screen]}
            </h1>
            <p className="text-sm text-muted">{subtitle}</p>
          </div>
        </div>

        {state.user ? (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 rounded-2xl border border-border bg-bg px-3 py-2 shadow-card md:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky/60 text-sm font-semibold text-navy">
                {initials(state.user.name)}
              </div>
              <div>
                <p className="text-sm font-bold text-text">{state.user.name}</p>
                <p className="text-xs text-muted">{state.user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text transition hover:border-blue hover:text-blue"
            >
              Sair
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
