import { useEffect, useMemo, useState } from "react";
import { COURSE_CONTENT } from "../../data/courseContent";
import {
  buildAttendanceExplanation,
  getWindowStatus,
} from "../../data/recoveryQuestions";
import { useApp } from "../../hooks/useAppStore";
import {
  fetchStudentOverview,
  fetchStudentStatus,
  postPresencaResult,
} from "../../utils/api";

interface EvaluationResult {
  foundRequired: string[];
  missingRequired: string[];
  foundBonus: string[];
  score: number;
  max: number;
  passed: boolean;
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function evaluatePrompt(
  answer: string,
  requiredItems: string[],
  bonusItems: string[],
  minimumRequiredToPass: number,
): EvaluationResult {
  const normalizedAnswer = normalize(answer);
  const foundRequired = requiredItems.filter((item) =>
    normalizedAnswer.includes(normalize(item)),
  );
  const missingRequired = requiredItems.filter(
    (item) => !normalizedAnswer.includes(normalize(item)),
  );
  const foundBonus = bonusItems.filter((item) =>
    normalizedAnswer.includes(normalize(item)),
  );
  const score = foundRequired.length + foundBonus.length;
  const max = requiredItems.length + bonusItems.length;
  return {
    foundRequired,
    missingRequired,
    foundBonus,
    score,
    max,
    passed: foundRequired.length >= minimumRequiredToPass,
  };
}

export default function DesafioPresenca() {
  const { navigate, state } = useApp();
  const course = state.user?.course ?? "ia-generativa";
  const challenge = COURSE_CONTENT[course].promptChallenge;
  const windowStatus = getWindowStatus(state.user?.email);
  const [promptText, setPromptText] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [baseAttendance, setBaseAttendance] = useState(78);

  useEffect(() => {
    async function load() {
      if (!state.user) return;
      console.log("DEBUG: Carregando dados do desafio para:", state.user.email);
      const [status, overview] = await Promise.all([
        fetchStudentStatus(state.user.email, state.user.course),
        fetchStudentOverview(state.user.email, state.user.course),
      ]);
      console.log("DEBUG: Status recebido:", status.challenge.status);
      setAlreadyCompleted(status.challenge.status === "completed");
      setBaseAttendance(overview?.profile.attendance_pct ?? 78);
    }

    void load();
  }, [state.user]);

  const rules = useMemo(
    () =>
      buildAttendanceExplanation(
        baseAttendance,
        evaluation
          ? Math.round((evaluation.score / Math.max(evaluation.max, 1)) * 100)
          : 0,
      ),
    [baseAttendance, evaluation],
  );

  const handleBackToPortal = () => {
    console.log("DEBUG: Botão 'Voltar ao portal' clicado!");
    if (typeof navigate === "function") {
      console.log("DEBUG: Chamando navigate('select')...");
      navigate("select");
    } else {
      console.error("DEBUG ERROR: A função navigate não existe no useApp!");
    }
  };

  if (!state.user) return null;

  // TELA: INDISPONÍVEL
  if (windowStatus !== "open") {
    return (
      <div className="w-full max-w-3xl animate-fade-up px-4 py-8 md:px-6">
        <div className="surface-panel p-8">
          <h2 className="text-3xl font-semibold text-text">
            Desafio indisponível
          </h2>
          <p className="mt-3 text-muted">
            A janela do desafio de presença não está aberta para este aluno.
          </p>
          <button
            type="button"
            className="primary-btn mt-6"
            onClick={handleBackToPortal}
          >
            Voltar ao portal
          </button>
        </div>
      </div>
    );
  }

  // TELA: JÁ ENVIADO
  if (alreadyCompleted && !evaluation) {
    return (
      <div className="w-full max-w-3xl animate-fade-up px-4 py-8 md:px-6 relative z-[9999]">
        <div className="surface-panel p-8">
          <h2 className="text-3xl font-semibold text-text">
            Desafio já enviado
          </h2>
          <p className="mt-3 text-muted">
            Este aluno já possui um envio salvo para o desafio de presença nesta
            trilha.
          </p>

          <button
            type="button"
            className="primary-btn mt-6 relative z-[10000] cursor-pointer"
            style={{
              backgroundColor: "#1E3A5F",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              display: "block",
            }}
            onClick={() => {
              console.log("Tentando navegar...");
              window.location.hash = "/select"; // Força a navegação via URL se o navigate falhar
              navigate("select");
            }}
          >
            Voltar ao portal
          </button>
        </div>
      </div>
    );
  }
  const handleSubmit = async () => {
    const result = evaluatePrompt(
      promptText,
      challenge.requiredItems,
      challenge.bonusItems ?? [],
      challenge.minimumRequiredToPass,
    );
    setEvaluation(result);
    setSaving(true);

    const challengePct = Math.round(
      (result.score / Math.max(result.max, 1)) * 100,
    );
    const finalPct = challengePct;

    try {
      await postPresencaResult({
        name: state.user!.name,
        email: state.user!.email,
        course: state.user!.course,
        score: result.score,
        max: result.max,
        passed: challengePct >= 75,
        previousPct: baseAttendance,
        challengePct,
        presencaPct: finalPct,
        promptText,
      });
      setAlreadyCompleted(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-6xl animate-fade-up px-4 py-8 md:px-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <section className="surface-panel p-6 md:p-8">
          <span className="eyebrow">Desafio de presença</span>
          <h2 className="mt-2 text-3xl font-semibold text-text">
            {challenge.title}
          </h2>
          <p className="mt-3 text-muted">{challenge.intro}</p>

          <div className="mt-6 rounded-card border border-border bg-bg p-5">
            <h3 className="text-xl font-semibold text-text">Cenário</h3>
            <p className="mt-3 text-muted">{challenge.scenario}</p>
            <ul className="mt-4 space-y-2 text-sm text-text">
              {challenge.instructions.map((instruction) => (
                <li key={instruction} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue" />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <label className="field-label">Seu prompt</label>
            <textarea
              className="field-textarea"
              value={promptText}
              onChange={(event) => setPromptText(event.target.value)}
              placeholder={challenge.placeholder}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving || promptText.trim().length < 40}
              className="primary-btn"
              onClick={() => void handleSubmit()}
            >
              {saving ? "Enviando..." : "Enviar desafio"}
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={handleBackToPortal}
            >
              Cancelar
            </button>
          </div>
        </section>

        <aside className="surface-panel p-6 md:p-8">
          <span className="eyebrow">Critério explicado</span>
          <h3 className="mt-2 text-2xl font-semibold text-text">
            Como o critério de presença funciona
          </h3>
          <div className="mt-5 space-y-4">
            <article className="rounded-card border border-border bg-bg p-4">
              <p className="text-sm font-semibold text-text">O que é exigido</p>
              <p className="mt-2 text-sm text-muted">
                Frequência final mínima de <strong>75%</strong>.
              </p>
            </article>
            <article className="rounded-card border border-border bg-bg p-4">
              <p className="text-sm font-semibold text-text">
                Limite de faltas permitido
              </p>
              <p className="mt-2 text-sm text-muted">
                Até <strong>25%</strong> de faltas no período.
              </p>
            </article>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="data-card">
              <span className="text-sm text-muted">Frequência atual</span>
              <strong
                className={`mt-2 block text-2xl font-semibold ${rules.currentPct >= 75 ? "stat-success" : "stat-danger"}`}
              >
                {rules.currentPct}%
              </strong>
            </div>
            <div className="data-card">
              <span className="text-sm text-muted">
                Frequência final projetada
              </span>
              <strong
                className={`mt-2 block text-2xl font-semibold ${rules.finalPct >= 75 ? "stat-success" : "stat-danger"}`}
              >
                {rules.finalPct}%
              </strong>
            </div>
          </div>

          {evaluation && (
            <div className="mt-6 rounded-card border border-border bg-bg p-5 animate-scale-in">
              <h4 className="text-lg font-semibold text-text">
                Feedback do envio
              </h4>
              <p className="mt-3 text-sm text-muted">
                Itens encontrados:{" "}
                <strong className="stat-success">
                  {evaluation.foundRequired.length}
                </strong>{" "}
                de <strong>{challenge.requiredItems.length}</strong>.
              </p>
              <button
                type="button"
                className="primary-btn mt-6 w-full"
                onClick={handleBackToPortal}
              >
                Voltar ao portal
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
