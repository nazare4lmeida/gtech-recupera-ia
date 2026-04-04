import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { AdminResultRow } from "../../types";
import { deleteAdminResults, fetchAdminResults } from "../../utils/api";
import { formatDateTime, pct } from "../../utils/helpers";

type Props = {
  onToast?: (msg: string, tone?: "info" | "success" | "error") => void;
};

type StatusFilter = "all" | "passed" | "failed";

function downloadXlsx(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");
  XLSX.writeFile(workbook, filename);
}

export default function AdminResults({ onToast }: Props) {
  const [rows, setRows] = useState<AdminResultRow[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);

  async function loadRows() {
    setLoading(true);

    try {
      const data = await fetchAdminResults();
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRows();

    const refresh = () => {
      void loadRows();
    };

    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        row.name.toLowerCase().includes(normalizedQuery) ||
        row.email.toLowerCase().includes(normalizedQuery) ||
        row.moduleLabel.toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "passed" && row.passed) ||
        (statusFilter === "failed" && !row.passed);

      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  const exportRows = useMemo(
    () =>
      filteredRows.map((row) => ({
        modulo: row.moduleLabel,
        curso:
          row.course === "ia-generativa"
            ? "IA Generativa"
            : row.course === "ia-soft-skills"
              ? "IA + Soft Skills"
              : (row.course ?? "-"),
        nome: row.name,
        email: row.email,
        nota: row.score,
        maximo: row.max,
        percentual: `${pct(row.score, row.max)}%`,
        aprovado: row.passed ? "Sim" : "Não",
        data: formatDateTime(row.ts),
      })),
    [filteredRows],
  );

  const selectedRows = useMemo(
    () => filteredRows.filter((row) => selected[`${row.module}-${row.id}`]),
    [filteredRows, selected],
  );

  const allVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every((row) => selected[`${row.module}-${row.id}`]);

  function toggleRow(row: AdminResultRow) {
    const key = `${row.module}-${row.id}`;
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleAllVisible() {
    const nextValue = !allVisibleSelected;

    setSelected((prev) => {
      const next = { ...prev };

      filteredRows.forEach((row) => {
        next[`${row.module}-${row.id}`] = nextValue;
      });

      return next;
    });
  }

  async function handleDeleteSelected() {
    if (!selectedRows.length) {
      onToast?.("Selecione pelo menos um resultado.", "info");
      return;
    }

    try {
      await deleteAdminResults(
        selectedRows.map((row) => ({
          id: row.id,
          module: row.module,
        })),
      );

      setSelected({});
      await loadRows();
      onToast?.(
        `${selectedRows.length} resultado(s) removido(s) com sucesso.`,
        "success",
      );
    } catch (error) {
      onToast?.(
        (error as Error).message || "Não foi possível excluir os resultados.",
        "error",
      );
    }
  }

  function handleExportXlsx() {
    if (!exportRows.length) {
      onToast?.("Não há resultados para exportar.", "info");
      return;
    }

    downloadXlsx("resultados-admin.xlsx", exportRows);
    onToast?.("Planilha XLSX exportada com sucesso.", "success");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow">Painel administrativo</span>
          <h2 className="mt-2 text-3xl font-semibold text-text">Resultados</h2>
          <p className="mt-2 max-w-3xl text-muted">
            Lista centralizada para acompanhar notas, status e histórico dos
            alunos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void loadRows()}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text transition hover:border-primary"
          >
            Atualizar
          </button>

          <button
            onClick={handleExportXlsx}
            className="rounded-xl bg-green px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Exportar XLSX
          </button>

          <button
            onClick={() => void handleDeleteSelected()}
            disabled={!selectedRows.length}
            className="rounded-xl bg-red px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Excluir selecionados
          </button>
        </div>
      </div>

      <section className="grid gap-3 rounded-card border border-border bg-surface p-4 shadow-card md:grid-cols-[1fr_180px_auto]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por aluno, e-mail ou módulo"
          className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
        >
          <option value="all">Todos os status</option>
          <option value="passed">Aprovados</option>
          <option value="failed">Reprovados</option>
        </select>

        <div className="self-center text-right text-sm text-muted">
          {filteredRows.length} registro(s) • {selectedRows.length}{" "}
          selecionado(s)
        </div>
      </section>

      <section className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-bg">
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                  />
                </th>

                {["Aluno", "Módulo", "Resultado", "Status", "Data"].map(
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
              {filteredRows.map((row) => {
                const key = `${row.module}-${row.id}`;

                return (
                  <tr key={key} className="border-t border-border">
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={!!selected[key]}
                        onChange={() => toggleRow(row)}
                      />
                    </td>

                    <td className="px-4 py-3 text-sm align-top">
                      <strong className="text-text">{row.name}</strong>
                      <div className="text-xs text-muted">{row.email}</div>
                    </td>

                    <td className="px-4 py-3 text-sm align-top text-text">
                      <div className="flex flex-col gap-1">
                        <span>{row.moduleLabel}</span>
                        {row.course ? (
                          <span className="text-xs text-muted">
                            {row.course === "ia-generativa"
                              ? "Curso: IA Generativa"
                              : row.course === "ia-soft-skills"
                                ? "Curso: IA + Soft Skills"
                                : `Curso: ${row.course}`}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm align-top">
                      <strong className="text-text">
                        {row.score}/{row.max}
                      </strong>
                      <span className="ml-1 text-muted">
                        ({pct(row.score, row.max)}%)
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top">
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

                    <td className="px-4 py-3 text-sm whitespace-nowrap align-top text-muted">
                      {formatDateTime(row.ts)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!filteredRows.length && !loading ? (
          <div className="px-5 py-12 text-center text-muted">
            Nenhum resultado encontrado.
          </div>
        ) : null}

        {loading ? (
          <div className="border-t border-border px-5 py-4 text-center text-sm text-muted">
            Carregando resultados…
          </div>
        ) : null}
      </section>
    </div>
  );
}
