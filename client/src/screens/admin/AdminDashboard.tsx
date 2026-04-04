import { useEffect, useMemo, useState } from "react";
import { AdminResultRow, AdminStats } from "../../types";
import { fetchAdminResults, fetchStats } from "../../utils/api";
import { formatDateTime, pct } from "../../utils/helpers";

const emptyStats: AdminStats = {
  totalStudents: 0,
  totalClasses: 0,
  totalSubjects: 0,
  totalAssessments: 0,
  attendanceAverage: 0,
  gradeAverage: 0,
  approvalRate: 0,
  riskCount: 0,
  quizCount: 0,
  recoveryCount: 0,
  presenceCount: 0,
};

function DashboardCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <article className="rounded-card border border-border bg-surface px-5 py-4 shadow-card">
      <span className="text-sm text-muted">{label}</span>
      <strong className="mt-2 block text-3xl font-semibold text-text">
        {value}
      </strong>
      {helper ? <p className="mt-2 text-sm text-muted">{helper}</p> : null}
    </article>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [latest, setLatest] = useState<AdminResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    try {
      const [statsData, resultsData] = await Promise.all([
        fetchStats(),
        fetchAdminResults(),
      ]);

      setStats(statsData ?? emptyStats);
      setLatest(Array.isArray(resultsData) ? resultsData.slice(0, 8) : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();

    const refresh = () => {
      void loadData();
    };

    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        label: "Total de alunos",
        value: stats.totalStudents,
        helper: "Cadastros de estudantes ativos.",
      },
      {
        label: "Resultados lançados",
        value: stats.quizCount + stats.recoveryCount + stats.presenceCount,
        helper: "Soma de quizzes, recuperações e desafios.",
      },
      {
        label: "Taxa de aprovação",
        value: `${stats.approvalRate}%`,
        helper: "Percentual geral de aprovação.",
      },
      {
        label: "Média de notas",
        value: stats.gradeAverage,
        helper: "Média acadêmica calculada no painel.",
      },
    ],
    [stats],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow">Painel administrativo</span>
          <h2 className="mt-2 text-3xl font-semibold text-text">Dashboard</h2>
          <p className="mt-2 max-w-3xl text-muted">
            Visão geral simples do acompanhamento dos alunos, com foco em
            resultados, aprovação e desempenho recente.
          </p>
        </div>

        <button
          onClick={() => void loadData()}
          className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text transition hover:border-primary"
        >
          Atualizar
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <DashboardCard
            key={card.label}
            label={card.label}
            value={card.value}
            helper={card.helper}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          label="Quizzes"
          value={stats.quizCount}
          helper="Resultados principais das formações."
        />
        <DashboardCard
          label="Recuperações"
          value={stats.recoveryCount}
          helper="Tentativas de recuperação registradas."
        />
        <DashboardCard
          label="Desafios práticos"
          value={stats.presenceCount}
          helper="Resultados dos desafios aplicados."
        />
      </div>

      <section className="rounded-card border border-border bg-surface shadow-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-text">Últimos resultados</h3>
            <p className="text-sm text-muted">
              Histórico recente para acompanhamento rápido.
            </p>
          </div>

          {loading ? (
            <span className="text-sm text-muted">Atualizando…</span>
          ) : null}
        </div>

        {latest.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-bg">
                  {["Aluno", "Módulo", "Nota", "Status", "Data"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-muted"
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {latest.map((row) => (
                  <tr
                    key={`${row.module}-${row.id}`}
                    className="border-t border-border"
                  >
                    <td className="px-4 py-3 text-sm">
                      <strong className="text-text">{row.name}</strong>
                      <div className="text-xs text-muted">{row.email}</div>
                    </td>

                    <td className="px-4 py-3 text-sm text-text">
                      {row.moduleLabel}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <strong className="text-text">
                        {row.score}/{row.max}
                      </strong>
                      <span className="ml-1 text-muted">
                        ({pct(row.score, row.max)}%)
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <span
                        className={
                          row.passed
                            ? "rounded-full bg-green-bg px-2.5 py-1 text-xs font-bold text-green"
                            : "rounded-full bg-red-bg px-2.5 py-1 text-xs font-bold text-red"
                        }
                      >
                        {row.passed ? "Aprovado" : "Reprovado"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                      {formatDateTime(row.ts)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-muted">
            Nenhum resultado registrado ainda.
          </div>
        )}
      </section>
    </div>
  );
}
