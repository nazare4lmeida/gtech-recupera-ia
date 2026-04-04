import express from "express";
import cors from "cors";
import { hasSupabaseConfig, supabase } from "./supabase";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import {
  AdminResultRow,
  PersistedDB,
  PresencaResult,
  Question,
  RecoveryResult,
  StudentResult,
} from "./types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE =
  process.env.DATA_FILE_PATH || path.resolve(__dirname, "..", "data", "db.json");
const RESULTS_TABLE = process.env.RESULTS_TABLE || "ia_results";
const RECOVERY_TABLE = process.env.RECOVERY_RESULTS_TABLE || "ia_recovery_results";
const PRACTICE_TABLE = process.env.PRESENCA_RESULTS_TABLE || "ia_practice_results";
const STATUS_TABLE = process.env.MODULE_STATUS_TABLE || "student_module_status";

type CourseSlug = "ia-generativa" | "ia-soft-skills";
const VALID_COURSES: CourseSlug[] = ["ia-generativa", "ia-soft-skills"];

type ModuleType = "recovery" | "challenge";

interface StudentModuleStatus {
  id?: number;
  email: string;
  course: CourseSlug;
  module_type: ModuleType;
  status: "not_started" | "in_progress" | "completed";
  attempt_count: number;
  completed_at?: number | null;
  updated_at?: number | null;
}

function normalizeCourse(value: unknown, fallback: CourseSlug = "ia-generativa"): CourseSlug {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "ia-generativa" || normalized === "ia-soft-skills") {
    return normalized;
  }

  return fallback;
}

const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");

      callback(null, isAllowed);
    },
  })
);

app.use(express.json());

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 1,
    order: 1,
    difficulty: "beginner",
    category: "prompting",
    text: "Qual característica torna um prompt mais útil para um modelo generativo?",
    options: [
      "Ser vago para deixar o modelo livre",
      "Trazer contexto, objetivo e formato esperado",
      "Usar apenas palavras-chave soltas",
      "Ter o maior número possível de emojis",
    ],
    correct: 1,
    feedbackOk:
      "<strong>Correto!</strong> Bons prompts costumam informar contexto, objetivo, público e formato de saída.",
    feedbackNok:
      "<strong>Quase!</strong> Quanto mais claro o contexto e o formato esperado, melhor tende a ser a resposta.",
  },
  {
    id: 2,
    order: 2,
    difficulty: "beginner",
    category: "ferramentas",
    text: "Ao usar IA generativa no trabalho, qual prática ajuda mais a reduzir retrabalho?",
    options: [
      "Pedir tudo do zero em cada interação",
      "Salvar prompts úteis e iterar versões",
      "Evitar revisar a resposta gerada",
      "Copiar qualquer saída sem checagem",
    ],
    correct: 1,
    feedbackOk:
      "<strong>Correto!</strong> Versionar prompts e iterar respostas acelera a rotina e melhora a consistência.",
    feedbackNok:
      "<strong>Quase!</strong> Criar um repertório de prompts reutilizáveis reduz retrabalho e aumenta produtividade.",
  },
  {
    id: 3,
    order: 3,
    difficulty: "intermediate",
    category: "etica",
    text: "Qual é a atitude mais adequada ao usar IA com dados sensíveis de clientes?",
    options: [
      "Enviar tudo diretamente para ganhar velocidade",
      "Remover ou anonimizar dados antes do uso",
      "Compartilhar a conversa com qualquer colega",
      "Ignorar política interna se o prazo estiver curto",
    ],
    correct: 1,
    feedbackOk:
      "<strong>Correto!</strong> Dados sensíveis devem ser minimizados, anonimizados e tratados conforme política da organização.",
    feedbackNok:
      "<strong>Quase!</strong> O uso responsável de IA exige cuidado com privacidade, compliance e minimização de dados.",
  },
  {
    id: 4,
    order: 4,
    difficulty: "intermediate",
    category: "colaboracao",
    text: "Em um fluxo com IA + soft skills, o que mais fortalece a colaboração entre pessoas e ferramenta?",
    options: [
      "Tratar a resposta da IA como decisão final",
      "Usar a IA para rascunhar e validar em equipe antes de publicar",
      "Eliminar feedback humano para ganhar tempo",
      "Evitar registrar premissas e critérios",
    ],
    correct: 1,
    feedbackOk:
      "<strong>Correto!</strong> A IA funciona melhor como copiloto: rascunha, acelera e apoia decisões revisadas por pessoas.",
    feedbackNok:
      "<strong>Quase!</strong> Colaboração forte combina apoio da IA com revisão, alinhamento e senso crítico do time.",
  },
  {
    id: 5,
    order: 5,
    difficulty: "hard",
    category: "prompting",
    text: "Qual prompt tende a gerar uma resposta mais previsível e útil?",
    options: [
      "Fale sobre liderança.",
      "Explique liderança para um time júnior em 5 tópicos, com exemplos práticos e tom objetivo.",
      "Escreva qualquer coisa sobre equipes.",
      "Me surpreenda sem contexto.",
    ],
    correct: 1,
    feedbackOk:
      "<strong>Correto!</strong> Especificidade sobre público, formato, quantidade e tom reduz ambiguidade e melhora a saída.",
    feedbackNok:
      "<strong>Quase!</strong> O prompt mais forte delimita público, objetivo, formato e tom da resposta.",
  },
];


function normalizeModuleType(value: unknown): ModuleType {
  return String(value ?? "").trim().toLowerCase() === "challenge" ? "challenge" : "recovery";
}

function normalizeStatusRow(row: any, moduleType: ModuleType, email: string, course: CourseSlug): StudentModuleStatus {
  return {
    id: row?.id,
    email: String(row?.email ?? email).trim().toLowerCase(),
    course: normalizeCourse(row?.course, course),
    module_type: normalizeModuleType(row?.module_type ?? moduleType),
    status: row?.status === "completed" ? "completed" : row?.status === "in_progress" ? "in_progress" : "not_started",
    attempt_count: toNumber(row?.attempt_count, 0),
    completed_at: row?.completed_at ?? null,
    updated_at: row?.updated_at ?? null,
  };
}

async function getModuleStatus(email: string, course: CourseSlug, moduleType: ModuleType): Promise<StudentModuleStatus> {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const sb = getSupabaseClient();

  if (!sb) {
    const rows = moduleType === "recovery" ? db.recoveryResults : db.presencaResults;
    const found = rows.find((item: any) => String(item.email ?? "").trim().toLowerCase() === normalizedEmail && normalizeCourse(item.course) === course);
    return {
      email: normalizedEmail,
      course,
      module_type: moduleType,
      status: found ? "completed" : "not_started",
      attempt_count: found ? 1 : 0,
      completed_at: found ? toTimestamp(found.ts) : null,
      updated_at: found ? toTimestamp(found.ts) : null,
    };
  }

  const { data, error } = await sb
    .from(STATUS_TABLE)
    .select("*")
    .eq("email", normalizedEmail)
    .eq("course", course)
    .eq("module_type", moduleType)
    .maybeSingle();

  if (error) throw error;
  return normalizeStatusRow(data, moduleType, normalizedEmail, course);
}

async function upsertModuleStatus(email: string, course: CourseSlug, moduleType: ModuleType, status: StudentModuleStatus["status"], completedAt?: number | null) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const sb = getSupabaseClient();
  if (!sb) return;

  const current = await getModuleStatus(normalizedEmail, course, moduleType);
  const payload = {
    email: normalizedEmail,
    course,
    module_type: moduleType,
    status,
    attempt_count: Math.max(1, current.attempt_count + (status === "completed" && current.status !== "completed" ? 1 : 0)),
    completed_at: status === "completed" ? (completedAt ?? Date.now()) : null,
    updated_at: Date.now(),
  };

  const { error } = await sb.from(STATUS_TABLE).upsert(payload, { onConflict: "email,course,module_type" });
  if (error) throw error;
}

async function assertModuleAvailable(email: string, course: CourseSlug, moduleType: ModuleType) {
  const status = await getModuleStatus(email, course, moduleType);
  if (status.status === "completed") {
    throw new Error(moduleType === "recovery" ? "Prova já concluída para este aluno." : "Desafio já concluído para este aluno.");
  }
}

async function resetModuleStatus(email: string, course: CourseSlug, moduleType: ModuleType) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const sb = getSupabaseClient();
  if (!sb) return;
  const { error } = await sb
    .from(STATUS_TABLE)
    .upsert({
      email: normalizedEmail,
      course,
      module_type: moduleType,
      status: "not_started",
      attempt_count: 0,
      completed_at: null,
      updated_at: Date.now(),
    }, { onConflict: "email,course,module_type" });
  if (error) throw error;
}

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(
        {
          results: [],
          recoveryResults: [],
          presencaResults: [],
          questions: DEFAULT_QUESTIONS,
        },
        null,
        2
      ),
      "utf-8"
    );
  }
}

function loadDB(): PersistedDB {
  ensureDataFile();

  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as Partial<PersistedDB>;

    return {
      results: parsed.results ?? [],
      recoveryResults: parsed.recoveryResults ?? [],
      presencaResults: parsed.presencaResults ?? [],
      questions: parsed.questions?.length ? parsed.questions : DEFAULT_QUESTIONS,
    };
  } catch {
    return {
      results: [],
      recoveryResults: [],
      presencaResults: [],
      questions: DEFAULT_QUESTIONS,
    };
  }
}

let db = loadDB();

function saveDB() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function getSupabaseClient() {
  return supabase;
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toTimestamp(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : Date.now();
}

function normalizeStudentResult(row: any): StudentResult {
  return {
    id: row.id,
    name: String(row.name ?? "").trim(),
    email: String(row.email ?? "").trim().toLowerCase(),
    course: normalizeCourse(row.course),
    score: toNumber(row.score),
    max: toNumber(row.max, 7),
    passed: Boolean(row.passed),
    ts: toTimestamp(row.ts),
    cats: row.cats ?? {},
  } as StudentResult;
}

async function getCourseResults(course: CourseSlug): Promise<StudentResult[]> {
  const sb = getSupabaseClient();

  if (!sb) {
    return db.results
      .map((r) => normalizeStudentResult(r))
      .filter((r) => normalizeCourse((r as any).course) === course)
      .sort((a, b) => b.ts - a.ts);
  }

  const { data, error } = await sb
    .from(RESULTS_TABLE)
    .select("*")
    .eq("course", course)
    .order("ts", { ascending: false });

  if (error) throw error;

  return (data ?? []).map(normalizeStudentResult);
}

async function getIaGenResults(): Promise<StudentResult[]> {
  return getCourseResults("ia-generativa");
}

async function getIaSoftSkillsResults(): Promise<StudentResult[]> {
  return getCourseResults("ia-soft-skills");
}

async function getAllMainResults(): Promise<StudentResult[]> {
  const [iaGen, iaSoft] = await Promise.all([getIaGenResults(), getIaSoftSkillsResults()]);
  return [...iaGen, ...iaSoft].sort((a, b) => b.ts - a.ts);
}

async function getRecoveryResults(): Promise<RecoveryResult[]> {
  const sb = getSupabaseClient();

  if (!sb) {
    return db.recoveryResults
      .map((r: any) => ({
        id: r.id,
        name: String(r.name ?? "").trim(),
        email: String(r.email ?? "").trim().toLowerCase(),
        course: normalizeCourse(r.course),
        score: toNumber(r.score),
        passed: Boolean(r.passed),
        ts: toTimestamp(r.ts),
        projectScore: r.projectScore ?? r.project_score,
        bestScore: r.bestScore ?? r.best_score,
      }))
      .sort((a, b) => b.ts - a.ts);
  }

  const { data, error } = await sb
    .from(RECOVERY_TABLE)
    .select("*")
    .order("ts", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: String(r.name ?? "").trim(),
    email: String(r.email ?? "").trim().toLowerCase(),
    course: normalizeCourse(r.course),
    score: toNumber(r.score),
    passed: Boolean(r.passed),
    ts: toTimestamp(r.ts),
    projectScore: r.project_score ?? r.projectScore,
    bestScore: r.best_score ?? r.bestScore,
  })) as RecoveryResult[];
}

async function getPresencaResults(): Promise<PresencaResult[]> {
  const sb = getSupabaseClient();

  if (!sb) {
    return db.presencaResults
      .map((r: any) => ({
        id: r.id,
        name: String(r.name ?? "").trim(),
        email: String(r.email ?? "").trim().toLowerCase(),
        course: normalizeCourse(r.course),
        score: toNumber(r.score),
        max: toNumber(r.max, 4),
        passed: Boolean(r.passed),
        ts: toTimestamp(r.ts),
        previousPct: r.previousPct ?? r.previous_pct,
        challengePct: r.challengePct ?? r.challenge_pct,
        presencaPct: r.presencaPct ?? r.presenca_pct ?? 0,
      }))
      .sort((a, b) => b.ts - a.ts);
  }

  const { data, error } = await sb
    .from(PRACTICE_TABLE)
    .select("*")
    .order("ts", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: String(r.name ?? "").trim(),
    email: String(r.email ?? "").trim().toLowerCase(),
    course: normalizeCourse(r.course),
    score: toNumber(r.score),
    max: toNumber(r.max, 4),
    passed: Boolean(r.passed),
    ts: toTimestamp(r.ts),
    previousPct: r.previous_pct ?? r.previousPct,
    challengePct: r.challenge_pct ?? r.challengePct,
    presencaPct: r.presenca_pct ?? r.presencaPct ?? 0,
  })) as PresencaResult[];
}

function buildAdminRowsFromData(
  results: StudentResult[],
  recoveryResults: RecoveryResult[],
  presencaResults: PresencaResult[]
): AdminResultRow[] {
  const mainRows: AdminResultRow[] = results.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    score: toNumber(r.score),
    max: toNumber(r.max, 7),
    passed: Boolean(r.passed),
    ts: toTimestamp(r.ts),
    module: normalizeCourse((r as any).course),
    moduleLabel:
      normalizeCourse((r as any).course) === "ia-generativa"
        ? "IA Generativa"
        : "IA + Soft Skills",
    course: normalizeCourse((r as any).course),
  }));

  const recovery: AdminResultRow[] = recoveryResults.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    score: typeof r.bestScore === "number" ? r.bestScore : toNumber(r.score),
    max: 10,
    passed: Boolean(r.passed),
    ts: toTimestamp(r.ts),
    module: "recuperacao",
    moduleLabel:
      normalizeCourse(r.course) === "ia-generativa"
        ? "Recuperação - IA Generativa"
        : "Recuperação - IA + Soft Skills",
    course: normalizeCourse(r.course),
  }));

  const presenca: AdminResultRow[] = presencaResults.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    score: typeof r.score === "number" ? r.score : toNumber(r.challengePct),
    max: typeof r.max === "number" ? r.max : 4,
    passed: Boolean(r.passed),
    ts: toTimestamp(r.ts),
    module: "presenca",
    moduleLabel:
      normalizeCourse(r.course) === "ia-generativa"
        ? "Desafio Prático - IA Generativa"
        : "Desafio Prático - IA + Soft Skills",
    course: normalizeCourse(r.course),
  }));

  return [...mainRows, ...recovery, ...presenca].sort((a, b) => b.ts - a.ts);
}

async function deleteRow(module: AdminResultRow["module"], id: number) {
  const sb = getSupabaseClient();

  const table =
    module === "ia-generativa" || module === "ia-soft-skills"
      ? RESULTS_TABLE
      : module === "recuperacao"
      ? RECOVERY_TABLE
      : PRACTICE_TABLE;

  if (sb) {
    const { error } = await sb.from(table).delete().eq("id", id);
    if (error) throw error;
    return;
  }

  if (module === "ia-generativa" || module === "ia-soft-skills") {
    db.results = db.results.filter((r: any) => r.id !== id);
  }

  if (module === "recuperacao") {
    db.recoveryResults = db.recoveryResults.filter((r) => r.id !== id);
  }

  if (module === "presenca") {
    db.presencaResults = db.presencaResults.filter((r) => r.id !== id);
  }

  saveDB();
}

async function syncModuleResetByDeletion(module: AdminResultRow["module"], id: number) {
  const sb = getSupabaseClient();
  if (!sb) return;

  if (module === "recuperacao") {
    const { data } = await sb.from(RECOVERY_TABLE).select("email, course").eq("id", id).maybeSingle();
    if (data?.email) await resetModuleStatus(data.email, normalizeCourse(data.course), "recovery");
  }

  if (module === "presenca") {
    const { data } = await sb.from(PRACTICE_TABLE).select("email, course").eq("id", id).maybeSingle();
    if (data?.email) await resetModuleStatus(data.email, normalizeCourse(data.course), "challenge");
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ts: Date.now() });
});


app.get("/api/student-status", async (req, res) => {
  try {
    const email = String(req.query.email ?? "").trim().toLowerCase();
    const course = normalizeCourse(req.query.course);
    const [recovery, challenge] = await Promise.all([
      getModuleStatus(email, course, "recovery"),
      getModuleStatus(email, course, "challenge"),
    ]);
    res.json({
      recovery: {
        status: recovery.status,
        canStart: recovery.status !== "completed",
        completedAt: recovery.completed_at ?? null,
        attemptCount: recovery.attempt_count,
      },
      challenge: {
        status: challenge.status,
        canStart: challenge.status !== "completed",
        completedAt: challenge.completed_at ?? null,
        attemptCount: challenge.attempt_count,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/questions", (_req, res) => {
  res.json(db.questions);
});

app.put("/api/questions/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = db.questions.findIndex((q) => q.id === id);

  if (idx < 0) {
    return res.status(404).json({ error: "Not found" });
  }

  db.questions[idx] = { ...db.questions[idx], ...req.body, id };
  saveDB();

  return res.json(db.questions[idx]);
});

app.get("/api/results", async (req, res) => {
  try {
    const requestedCourse = req.query.course;

    if (requestedCourse) {
      const course = normalizeCourse(requestedCourse);
      return res.json(await getCourseResults(course));
    }

    return res.json(await getAllMainResults());
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/results", async (req, res) => {
  try {
    const sb = getSupabaseClient();

    const payload = {
      name: String(req.body.name ?? "").trim(),
      email: String(req.body.email ?? "").trim().toLowerCase(),
      course: normalizeCourse(req.body.course),
      score: toNumber(req.body.score),
      max: toNumber(req.body.max, 7),
      passed: Boolean(req.body.passed),
      cats: req.body.cats ?? {},
      ts: Date.now(),
    };

    if (!sb) {
      const nextId = db.results.reduce((m, i: any) => Math.max(m, i.id), 0) + 1;
      const saved = { id: nextId, ...payload };
      db.results = [saved, ...db.results];
      saveDB();
      return res.status(201).json(saved);
    }

    const { data, error } = await sb
      .from(RESULTS_TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/results/:id", async (req, res) => {
  try {
    const module = normalizeCourse(req.query.course);
    await deleteRow(module, parseInt(req.params.id, 10));
    res.json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/recovery-results", async (req, res) => {
  try {
    const all = await getRecoveryResults();
    const requestedCourse = req.query.course;

    if (requestedCourse) {
      const course = normalizeCourse(requestedCourse);
      return res.json(all.filter((r) => normalizeCourse(r.course) === course));
    }

    return res.json(all);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/recovery-results", async (req, res) => {
  try {
    const sb = getSupabaseClient();
    const course = normalizeCourse(req.body.course);

    const email = String(req.body.email ?? "").trim().toLowerCase();
    await assertModuleAvailable(email, course, "recovery");

    const payload = {
      name: String(req.body.name ?? "").trim(),
      email,
      course,
      score: toNumber(req.body.score),
      passed: Boolean(req.body.passed),
      project_score: req.body.projectScore ?? null,
      best_score:
        req.body.projectScore != null
          ? Math.max(toNumber(req.body.score), toNumber(req.body.projectScore))
          : toNumber(req.body.score),
      ts: Date.now(),
    };

    if (!sb) {
      const nextId =
        db.recoveryResults.reduce((m, i) => Math.max(m, i.id), 0) + 1;

      const saved = {
        id: nextId,
        name: payload.name,
        email: payload.email,
        course: payload.course,
        score: payload.score,
        passed: payload.passed,
        ts: payload.ts,
        projectScore: payload.project_score ?? undefined,
        bestScore: payload.best_score,
      };

      db.recoveryResults = [saved, ...db.recoveryResults];
      saveDB();
      return res.status(201).json(saved);
    }

    const { data, error } = await sb
      .from(RECOVERY_TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    await upsertModuleStatus(payload.email, course, "recovery", "completed", payload.ts);

    return res.status(201).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/recovery-results/:id", async (req, res) => {
  try {
    await syncModuleResetByDeletion("recuperacao", parseInt(req.params.id, 10));
    await deleteRow("recuperacao", parseInt(req.params.id, 10));
    res.json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/presenca-results", async (req, res) => {
  try {
    const all = await getPresencaResults();
    const requestedCourse = req.query.course;

    if (requestedCourse) {
      const course = normalizeCourse(requestedCourse);
      return res.json(all.filter((r) => normalizeCourse(r.course) === course));
    }

    return res.json(all);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/presenca-results", async (req, res) => {
  try {
    const sb = getSupabaseClient();
    const course = normalizeCourse(req.body.course);

    const email = String(req.body.email ?? "").trim().toLowerCase();
    await assertModuleAvailable(email, course, "challenge");

    const payload = {
      name: String(req.body.name ?? "").trim(),
      email,
      course,
      score: toNumber(req.body.score),
      max: toNumber(req.body.max, 4),
      passed: Boolean(req.body.passed),
      previous_pct: req.body.previousPct ?? null,
      challenge_pct: req.body.challengePct ?? null,
      presenca_pct: req.body.presencaPct ?? null,
      ts: Date.now(),
    };

    if (!sb) {
      const nextId =
        db.presencaResults.reduce((m, i) => Math.max(m, i.id), 0) + 1;

      const saved = {
        id: nextId,
        name: payload.name,
        email: payload.email,
        course: payload.course,
        score: payload.score,
        max: payload.max,
        passed: payload.passed,
        previousPct: payload.previous_pct ?? undefined,
        challengePct: payload.challenge_pct ?? undefined,
        presencaPct: payload.presenca_pct ?? 0,
        ts: payload.ts,
      };

      db.presencaResults = [saved, ...db.presencaResults];
      saveDB();
      return res.status(201).json(saved);
    }

    const { data, error } = await sb
      .from(PRACTICE_TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    await upsertModuleStatus(payload.email, course, "challenge", "completed", payload.ts);

    return res.status(201).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/presenca-results/:id", async (req, res) => {
  try {
    await syncModuleResetByDeletion("presenca", parseInt(req.params.id, 10));
    await deleteRow("presenca", parseInt(req.params.id, 10));
    res.json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin-results", async (_req, res) => {
  try {
    const [results, recoveryResults, presencaResults] = await Promise.all([
      getAllMainResults(),
      getRecoveryResults(),
      getPresencaResults(),
    ]);

    res.json(buildAdminRowsFromData(results, recoveryResults, presencaResults));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin-results", async (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];

  try {
    await Promise.all(
      rows.map(async (row: { id?: number; module?: AdminResultRow["module"] }) => {
        if (typeof row?.id === "number" && row?.module) {
          if (row.module === "recuperacao" || row.module === "presenca") {
            await syncModuleResetByDeletion(row.module, row.id);
          }
          return deleteRow(row.module, row.id);
        }
        return Promise.resolve();
      })
    );

    res.json({ ok: true, deleted: rows.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/stats", async (_req, res) => {
  try {
    const [results, recoveryResults, presencaResults] = await Promise.all([
      getAllMainResults(),
      getRecoveryResults(),
      getPresencaResults(),
    ]);

    const allResults = buildAdminRowsFromData(results, recoveryResults, presencaResults);
    const total = allResults.length;
    const passed = allResults.filter((r) => r.passed).length;

    const avgPct = total
      ? Math.round(
          allResults.reduce((sum, r) => {
            const pct = r.max > 0 ? Math.round((r.score / r.max) * 100) : 0;
            return sum + pct;
          }, 0) / total
        )
      : 0;

    const cats: Record<string, { correct: number; total: number }> = {};

    results.forEach((r) => {
      Object.entries((r as any).cats || {}).forEach(([category, value]) => {
        if (!cats[category]) {
          cats[category] = { correct: 0, total: 0 };
        }

        cats[category].correct += toNumber((value as any).c);
        cats[category].total += toNumber((value as any).t);
      });
    });

    const iaGenCount = results.filter(
      (r) => normalizeCourse((r as any).course) === "ia-generativa"
    ).length;

    const iaSoftCount = results.filter(
      (r) => normalizeCourse((r as any).course) === "ia-soft-skills"
    ).length;

    res.json({
      total,
      passed,
      failed: total - passed,
      avgPct,
      categories: cats,
      modules: {
        iaGenerativa: iaGenCount,
        iaSoftSkills: iaSoftCount,
        recovery: recoveryResults.length,
        presenca: presencaResults.length,
      },
      recovery: {
        total: recoveryResults.length,
        passed: recoveryResults.filter((r) => r.passed).length,
        iaGenerativa: recoveryResults.filter(
          (r) => normalizeCourse(r.course) === "ia-generativa"
        ).length,
        iaSoftSkills: recoveryResults.filter(
          (r) => normalizeCourse(r.course) === "ia-soft-skills"
        ).length,
      },
      presenca: {
        total: presencaResults.length,
        avgPct: presencaResults.length
          ? Math.round(
              presencaResults.reduce((sum, r) => sum + toNumber(r.presencaPct), 0) /
                presencaResults.length
            )
          : 0,
        iaGenerativa: presencaResults.filter(
          (r) => normalizeCourse(r.course) === "ia-generativa"
        ).length,
        iaSoftSkills: presencaResults.filter(
          (r) => normalizeCourse(r.course) === "ia-soft-skills"
        ).length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin-auth", (req, res) => {
  const { email, adminCode } = req.body ?? {};

  const isValid =
    String(email ?? "").trim().toLowerCase() ===
      String(process.env.ADMIN_EMAIL ?? "").trim().toLowerCase() &&
    String(adminCode ?? "").trim() ===
      String(process.env.ADMIN_ACCESS_CODE ?? "").trim();

  res.json({ ok: isValid });
});

if (!hasSupabaseConfig) {
  console.warn(
    "[server] Supabase não configurado. Usando persistência local em",
    DATA_FILE
  );
}

app.listen(PORT, () => {
  console.log(`✅ Gtech IA Lab API → http://localhost:${PORT}`);
});

export default app;