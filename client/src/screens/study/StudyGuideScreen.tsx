import { useState } from "react";
import { COURSE_CONTENT } from "../../data/courseContent";
import { useApp } from "../../hooks/useAppStore";

const TOPIC_ICONS = ["🧠", "🔗", "📦", "🤖", "💬", "⚡"];

export default function StudyGuideScreen() {
  const { navigate, state } = useApp();
  const course = state.user?.course ?? "ia-generativa";
  const content = COURSE_CONTENT[course];
  const [openTopic, setOpenTopic] = useState<number | null>(0);

  return (
    <div className="w-full max-w-6xl animate-fade-up px-4 py-8 md:px-6">
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow">Roteiro de estudos</span>
          <h2 className="mt-2 text-3xl font-semibold text-text">
            {content.studyTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-muted">{content.studyIntro}</p>
        </div>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate("select")}
        >
          ← Voltar ao portal
        </button>
      </div>

      {/* Tópicos em accordion */}
      <section className="mb-6">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
          Conteúdo da prova
        </h3>
        <div className="space-y-3">
          {content.studyTopics.map((topic, i) => {
            const isOpen = openTopic === i;
            return (
              <div
                key={topic.title}
                className="overflow-hidden rounded-xl border border-border bg-surface shadow-card transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenTopic(isOpen ? null : i)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-bg"
                >
                  <span className="text-2xl">{TOPIC_ICONS[i] ?? "📌"}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-text">{topic.title}</p>
                    <p className="mt-0.5 text-sm text-muted">{topic.summary}</p>
                  </div>
                  <span className="text-lg text-muted">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-border px-5 pb-5 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                          O que saber
                        </p>
                        <ul className="space-y-2">
                          {topic.bullets.map((bullet) => (
                            <li
                              key={bullet}
                              className="flex items-start gap-2 text-sm text-text"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--blue)]" />
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-border bg-bg p-4">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                          Exemplo prático
                        </p>
                        <ul className="space-y-1.5">
                          {topic.example.map((item, j) => (
                            <li
                              key={item}
                              className={`text-sm ${j === 0 ? "font-semibold text-text" : "text-muted"}`}
                            >
                              {j > 0 && (
                                <span className="mr-1 text-[var(--blue)]">
                                  ›
                                </span>
                              )}
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Dicas + Checklist */}
      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h3 className="font-semibold text-text">Dicas para o desafio</h3>
          </div>
          <ol className="space-y-3">
            {content.challengeTips.map((tip, i) => (
              <li key={tip} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--blue)] text-[0.65rem] font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-text">{tip}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">✅</span>
            <h3 className="font-semibold text-text">Checklist final</h3>
          </div>
          <ul className="space-y-2">
            {content.finalChecklist.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text"
              >
                <span className="mt-0.5 text-[var(--green)]">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Modelo de prompt — ocupa as 2 colunas */}
        <section className="md:col-span-2 rounded-xl border border-border bg-surface p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h3 className="font-semibold text-text">
              Modelo de prompt para o desafio
            </h3>
          </div>
          <p className="mb-4 text-sm text-muted">
            Use este modelo como base fiel para responder o Desafio de Presença.
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-border bg-bg p-5 text-sm leading-relaxed text-text font-mono w-full min-h-[320px]">
            {course === "ia-generativa"
              ? `Você é um assistente de IA especializado em responder dúvidas de alunos.

Regras obrigatórias:
- Usar apenas o contexto fornecido na entrada. Nunca use conhecimento externo.
- Não invente informações. Se a informação não estiver no contexto, responda: "Não encontrei essa informação no material disponível."
- Cite a fonte ou trecho que embasou sua resposta ao final de cada ponto.
- Responda em tópicos numerados.
- Use máximo de 5 linhas por resposta.
- Tom claro e objetivo em todas as respostas.
- Priorize precisão acima de completude.
- Indique quando houver ambiguidade no contexto ou na pergunta.

Contexto:
RAG (Retrieval-Augmented Generation) é uma técnica que combina recuperação de documentos com geração de texto. Em vez de depender apenas do conhecimento do modelo, o sistema busca trechos relevantes de uma base documental e os fornece como contexto para a resposta. Isso reduz alucinações porque o modelo é instruído a responder apenas com base no material recuperado.

Pergunta do usuário:
O que é RAG e como ele reduz alucinações?`
              : `Você é um especialista em comunicação profissional em ambientes de tecnologia.

Sua tarefa é transformar o comentário técnico abaixo em um feedback profissional estruturado.

Diretrizes obrigatórias:
- Tom respeitoso e empático em todo o texto.
- Linguagem clara, direta e adaptada ao contexto profissional.
- Evite linguagem agressiva, julgamentos pessoais ou generalizações.
- Considere o contexto do público ao escolher o tom e o nível de detalhe.
- Seja objetivo: foque no que é concreto e observável.
- Mantenha empatia durante toda a resposta.

Estrutura obrigatória da resposta:
1. Pontos fortes — reconheça o que foi bem feito.
2. Oportunidades de melhoria — indique o que pode evoluir e como.
3. Próximos passos — sugira ações concretas e alcançáveis.

Observação a transformar:

O João entrega tudo atrasado, não se comunica e o código dele sempre tem bug.`}
          </pre>
        </section>
      </div>
    </div>
  );
}
