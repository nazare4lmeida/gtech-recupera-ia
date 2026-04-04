import { useMemo, useState } from "react";
import { useApp } from "../hooks/useAppStore";
import { upsertProfile, validateAdminAccess } from "../utils/api";

export default function LoginScreen() {
  const { bootstrapReady, login } = useApp();
  const [role, setRole] = useState<"student" | "admin">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState<"ia-generativa" | "ia-soft-skills">(
    "ia-generativa",
  );
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const courseDescription = useMemo(
    () =>
      course === "ia-generativa"
        ? "Trilha orientada a prompting, fundamentos de modelos e uso responsável de IA."
        : "Trilha focada em produtividade, colaboração e comunicação com IA.",
    [course],
  );

  const validate = () => {
    const next: Record<string, string> = {};

    if (!name.trim() || name.trim().split(" ").filter(Boolean).length < 2) {
      next.name = "Informe nome e sobrenome.";
    }

    if (!email.trim() || !email.includes("@")) {
      next.email = "Informe um e-mail válido.";
    }

    if (role === "admin" && !adminCode.trim()) {
      next.adminCode = "Informe o código de acesso do administrador.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !bootstrapReady) return;

    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);
    setErrors({});

    try {
      if (role === "admin") {
        const adminStatus = await validateAdminAccess({
          email: normalizedEmail,
          adminCode: adminCode.trim(),
        });

        if (!adminStatus.ok) {
          setErrors({
            adminCode: "Código de acesso inválido para este administrador.",
          });
          return;
        }

        await login({
          id: `admin-${normalizedEmail}`,
          name: name.trim(),
          email: normalizedEmail,
          course: "ia-generativa",
          role: "admin",
          classroomId: null,
        });

        return;
      }

      const profile = await upsertProfile({
        full_name: name.trim(),
        email: normalizedEmail,
        role,
        course,
      });

      await login({
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        course: profile.course,
        role: profile.role,
        classroomId: profile.classroom_id ?? null,
      });
    } catch (error) {
      setErrors({
        form: (error as Error).message || "Não foi possível entrar no sistema.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl animate-fade-up px-4 py-8 md:px-6">
      <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <section className="surface-panel overflow-hidden p-0">
          <div className="hero-panel">
            <div className="max-w-2xl space-y-5">
              <span className="eyebrow">
                Sistema escolar · IA Generativa · IA + Soft Skills
              </span>
              <h2 className="text-balance text-2xl font-semibold md:text-5xl">
                Geração Tech - Formações de IA
              </h2>
              <p className="max-w-xl text-base text-muted md:text-lg">
                Faça login como aluno para acessar trilhas, recuperação e
                desafio de presença.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="mini-stat">
                  <strong>Prova de Recuperação</strong>
                  <span>Com conteúdo específico.</span>
                </div>
                <div className="mini-stat">
                  <strong>Desafio de Presença</strong>
                  <span>
                    Atividade prática para validar a participação ativa dos
                    alunos.
                  </span>
                </div>
                <div className="mini-stat">
                  <strong>Material de Estudo e de Apoio</strong>
                  <span>
                    Para auxiliar no aprendizado e na preparação para as
                    avaliações.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-panel p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`segmented-btn ${role === "student" ? "segmented-btn-active" : ""}`}
            >
              Acesso do aluno
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`segmented-btn ${role === "admin" ? "segmented-btn-active" : ""}`}
            >
              Acesso do administrador
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="field-label">Nome completo</label>
              <input
                className="field-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Maria Silva"
              />
              {errors.name ? (
                <p className="field-error">{errors.name}</p>
              ) : null}
            </div>

            <div>
              <label className="field-label">E-mail</label>
              <input
                className="field-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Ex.: maria@escola.com"
              />
              {errors.email ? (
                <p className="field-error">{errors.email}</p>
              ) : null}
            </div>

            {role === "student" ? (
              <div>
                <label className="field-label">Trilha</label>
                <select
                  className="field-input"
                  value={course}
                  onChange={(event) =>
                    setCourse(
                      event.target.value as "ia-generativa" | "ia-soft-skills",
                    )
                  }
                >
                  <option value="ia-generativa">IA Generativa</option>
                  <option value="ia-soft-skills">IA + Soft Skills</option>
                </select>
                <p className="mt-2 text-sm text-muted">{courseDescription}</p>
              </div>
            ) : null}

            {role === "admin" ? (
              <>
                <div>
                  <label className="field-label">
                    Código de acesso do administrador
                  </label>
                  <input
                    type="password"
                    className="field-input"
                    value={adminCode}
                    onChange={(event) => setAdminCode(event.target.value)}
                    placeholder="Informe o código do administrador"
                  />
                  {errors.adminCode ? (
                    <p className="field-error">{errors.adminCode}</p>
                  ) : null}
                </div>

                <div className="rounded-card border border-gold-bdr bg-gold-bg px-4 py-3 text-sm text-gold animate-reveal">
                  Para entrar como administrador, use o e-mail configurado no
                  backend e o código definido no acesso administrativo.
                </div>
              </>
            ) : null}

            {errors.form ? <p className="field-error">{errors.form}</p> : null}

            <button
              type="button"
              disabled={loading || !bootstrapReady}
              onClick={() => void handleSubmit()}
              className="primary-btn w-full"
            >
              {loading
                ? "Entrando..."
                : bootstrapReady
                  ? "Entrar no sistema"
                  : "Preparando ambiente..."}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
