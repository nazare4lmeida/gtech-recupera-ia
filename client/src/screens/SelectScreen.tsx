import { useEffect, useState } from "react";
import { useApp } from "../hooks/useAppStore";
import { fetchStudentOverview } from "../utils/api";
import { StudentOverview } from "../types";

function pct(score: number, max: number) {
  if (!max) return 0;
  return Math.round((score / max) * 100);
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SelectScreen() {
  const { navigate, state } = useApp();
  const [overview, setOverview] = useState<StudentOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!state.user) return;
      try {
        const data = await fetchStudentOverview(
          state.user.email,
          state.user.course,
        );
        setOverview(data);
      } catch {
        // silently fail — modules still accessible
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [state.user]);

  if (!state.user) return null;

  const recoveryDone = !!overview?.recoveryResult;
  const presencaDone = !!overview?.presenceResult;

  const rec = overview?.recoveryResult ?? null;
  const pre = overview?.presenceResult ?? null;

  const recPassed = rec ? rec.score >= 6 : false;

  return (
    <div className="mx-auto w-full max-w-4xl animate-fade-up px-4 py-10 md:px-6">
      <div className="mb-8">
        <span className="eyebrow">Portal do aluno</span>
        <h2 className="mt-2 text-3xl font-semibold text-text">
          Olá, {state.user.name.split(" ")[0]}
        </h2>
        <p className="mt-2 text-muted">
          Trilha:{" "}
          <strong className="text-text">
            {state.user.course === "ia-generativa"
              ? "IA Generativa"
              : "IA + Soft Skills"}
          </strong>
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* ── PROVA DE RECUPERAÇÃO ── */}
        <div className="surface-panel flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-2">
            <span className="text-3xl">📝</span>
            {loading ? (
              <span className="text-xs font-semibold text-muted">
                Carregando...
              </span>
            ) : recoveryDone ? (
              <span className="rounded-full bg-[var(--green-bg)] px-3 py-1 text-xs font-semibold text-[var(--green)] border border-[var(--green-bdr)]">
                Concluído
              </span>
            ) : (
              <span className="rounded-full bg-[var(--gold-bg)] px-3 py-1 text-xs font-semibold text-[var(--gold)] border border-[var(--gold-bdr)]">
                Pendente
              </span>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text">
              Prova de Recuperação
            </h3>
            <p className="mt-2 text-sm text-muted">
              {recoveryDone
                ? "Você já realizou a prova. Veja seu resultado abaixo."
                : "Realize a prova de recuperação para melhorar seu desempenho na trilha."}
            </p>

            {rec && (
              <div className="result-card">
                <div className="result-score-row">
                  <span className="result-score-label">Aproveitamento</span>
                  <span
                    className={`result-score-value ${rec.passed ? "stat-success" : "stat-danger"}`}
                  >
                    {rec.score} / 10 pts
                  </span>
                </div>
                <div className="result-bar-track">
                  <div
                    className={
                      recPassed
                        ? "result-bar-fill-green"
                        : "result-bar-fill-red"
                    }
                    style={{ width: `${Math.min(100, pct(rec.score, 10))}%` }}
                  />
                </div>
                <div className="result-meta-row">
                  <span
                    className={
                      rec.passed
                        ? "result-meta-status-ok"
                        : "result-meta-status-fail"
                    }
                  >
                    {recPassed ? "✅ Aprovado" : "❌ Não aprovado"}
                  </span>
                  <span>{formatDate(rec.ts)}</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className={recoveryDone ? "secondary-btn" : "primary-btn"}
            onClick={() => navigate("recuperacao")}
          >
            {recoveryDone ? "Ver novamente" : "Acessar"}
          </button>
        </div>

        {/* ── DESAFIO DE PRESENÇA ── */}
        <div className="surface-panel flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-2">
            <span className="text-3xl">✅</span>
            {loading ? (
              <span className="text-xs font-semibold text-muted">
                Carregando...
              </span>
            ) : presencaDone ? (
              <span className="rounded-full bg-[var(--green-bg)] px-3 py-1 text-xs font-semibold text-[var(--green)] border border-[var(--green-bdr)]">
                Concluído
              </span>
            ) : (
              <span className="rounded-full bg-[var(--gold-bg)] px-3 py-1 text-xs font-semibold text-[var(--gold)] border border-[var(--gold-bdr)]">
                Pendente
              </span>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text">
              Desafio de Presença
            </h3>
            <p className="mt-2 text-sm text-muted">
              {presencaDone
                ? "Desafio enviado. Veja como ficou sua frequência final abaixo."
                : "Complete o desafio de prompt para recuperar sua frequência."}
            </p>

            {pre && (
              <div className="result-card">
                <div className="result-pct-box">
                  <p className="result-pct-label">Frequência final</p>
                  <p
                    className={
                      pre.presencaPct >= 75
                        ? "result-pct-value-ok"
                        : "result-pct-value-fail"
                    }
                  >
                    {pre.presencaPct}%
                  </p>
                </div>
                <div className="result-bar-track">
                  <div
                    className={
                      pre.presencaPct >= 75
                        ? "result-bar-fill-green"
                        : "result-bar-fill-red"
                    }
                    style={{ width: `${Math.min(100, pre.presencaPct)}%` }}
                  />
                </div>
                <div className="result-meta-row">
                  <span
                    className={
                      pre.passed ? "result-meta-ok" : "result-meta-fail"
                    }
                  >
                    {pre.passed
                      ? "✅ Presença regularizada"
                      : "❌ Frequência insuficiente"}
                  </span>
                  <span>{formatDate(pre.ts)}</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className={presencaDone ? "secondary-btn" : "primary-btn"}
            onClick={() => navigate("presenca")}
          >
            {presencaDone ? "Ver novamente" : "Acessar"}
          </button>
        </div>

        {/* ── MATERIAL DE ESTUDO ── */}
        <div className="surface-panel flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-2">
            <span className="text-3xl">📚</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text">
              Material de Estudo
            </h3>
            <p className="mt-2 text-sm text-muted">
              Acesse o roteiro de estudos com os tópicos e recursos da trilha.
              Ele é recomendado para revisar conteúdos, se preparar para
              avaliações ou aprofundar conhecimentos.
            </p>
          </div>
          <button
            type="button"
            className="primary-btn"
            onClick={() => navigate("roteiro")}
          >
            Acessar
          </button>
        </div>
      </div>
    </div>
  );
}
