import {
  CourseTrack,
  PromptChallengeDefinition,
  RecoveryQuestion,
} from "../types";

export interface StudyTopic {
  title: string;
  summary: string;
  bullets: string[];
  example: string[];
}

interface CourseContentDefinition {
  title: string;
  studyTitle: string;
  studyIntro: string;
  studyTopics: StudyTopic[];
  challengeStudyTitle: string;
  challengeStudyIntro: string;
  challengeTips: string[];
  finalChecklist: string[];
  recoveryQuestions: RecoveryQuestion[];
  promptChallenge: PromptChallengeDefinition;
}

const IA_GENERATIVA_QUESTIONS: RecoveryQuestion[] = [
  {
    id: 101,
    category: "Modelos",
    text: "Qual opção descreve melhor o que um modelo de linguagem faz?",
    options: [
      "Executa código automaticamente em qualquer sistema",
      "Prevê padrões linguísticos para gerar ou transformar texto",
      "Armazena documentos em banco vetorial",
      "Substitui a etapa de validação humana",
    ],
    correct: 1,
    explanation:
      "Modelos de linguagem geram texto com base em padrões aprendidos e previsões probabilísticas.",
  },
  {
    id: 102,
    category: "Prompting",
    text: "Qual prompt tende a gerar uma resposta mais previsível e útil?",
    options: [
      "Fale qualquer coisa sobre IA",
      "Explique embeddings",
      "Explique embeddings para iniciantes em 5 tópicos, com exemplo prático e linguagem simples",
      "Me surpreenda",
    ],
    correct: 2,
    explanation:
      "Prompts com contexto, público, formato e objetivo reduzem ambiguidade e melhoram a saída.",
  },
  {
    id: 103,
    category: "Ferramentas",
    text: "Ao integrar um LLM a um sistema via API, qual prática é mais adequada?",
    options: [
      "Salvar a chave da API no frontend",
      "Ignorar timeout e tratamento de erro",
      "Fazer chamadas autenticadas no backend com logs e tratamento de falha",
      "Executar tudo manualmente em produção",
    ],
    correct: 2,
    explanation:
      "Integrações de produção devem proteger segredos, tratar erros e manter rastreabilidade.",
  },
  {
    id: 104,
    category: "Modelos",
    text: "Em um fluxo RAG, qual é o papel principal dos embeddings?",
    options: [
      "Criptografar o conteúdo dos documentos",
      "Transformar texto em vetores para busca semântica",
      "Treinar novamente o modelo para cada pergunta",
      "Substituir completamente o banco de dados",
    ],
    correct: 1,
    explanation:
      "Embeddings representam semanticamente textos e consultas para recuperação por similaridade.",
  },
  {
    id: 105,
    category: "Ferramentas",
    text: "Qual cenário representa melhor o uso de webhooks em workflows com IA?",
    options: [
      "Editar prompts manualmente toda vez",
      "Receber automaticamente um evento e disparar uma etapa do fluxo",
      "Treinar um novo modelo local",
      "Desligar integrações externas",
    ],
    correct: 1,
    explanation:
      "Webhooks são úteis para acionar processos automaticamente a partir de eventos externos.",
  },
  {
    id: 106,
    category: "Prompting",
    text: "Se você quer reduzir alucinações em uma resposta, qual instrução ajuda mais?",
    options: [
      "Responda com criatividade máxima",
      "Invente se faltar contexto",
      "Use apenas o contexto fornecido e informe quando não houver base suficiente",
      "Responda o mais rápido possível",
    ],
    correct: 2,
    explanation:
      "Limitar a resposta ao contexto disponível e exigir transparência reduz respostas inventadas.",
  },
  {
    id: 107,
    category: "Ferramentas",
    text: "Qual opção descreve melhor um benefício de organizar dados em repositórios estruturados?",
    options: [
      "Eliminar a necessidade de revisão",
      "Melhorar recuperação, consistência e integração com fluxos automatizados",
      "Substituir APIs externas",
      "Garantir 100% de acerto do modelo",
    ],
    correct: 1,
    explanation:
      "Dados organizados favorecem recuperação eficiente, governança e automação.",
  },
  {
    id: 108,
    category: "Modelos",
    text: "O que melhor caracteriza um agente em IA generativa?",
    options: [
      "Um arquivo PDF com respostas prontas",
      "Um fluxo que recebe objetivo, toma ações e pode usar ferramentas",
      "Apenas uma interface visual bonita",
      "Uma planilha sem integração",
    ],
    correct: 1,
    explanation:
      "Agentes usam modelo, contexto e ferramentas para executar ações orientadas a objetivo.",
  },
  {
    id: 109,
    category: "Ética",
    text: "Qual prática é mais adequada ao usar IA com dados internos sensíveis?",
    options: [
      "Enviar tudo sem filtro para ganhar velocidade",
      "Anonimizar ou minimizar os dados antes do uso",
      "Compartilhar prompts com qualquer pessoa",
      "Ignorar regras de privacidade se o prazo estiver curto",
    ],
    correct: 1,
    explanation:
      "O uso responsável de IA exige minimização de dados, privacidade e conformidade.",
  },
  {
    id: 110,
    category: "Ferramentas",
    text: "Em uma arquitetura multiagente, qual é uma vantagem comum?",
    options: [
      "Eliminar totalmente a necessidade de supervisão",
      "Dividir responsabilidades entre agentes especializados",
      "Remover a necessidade de contexto",
      "Garantir resposta correta sem validação",
    ],
    correct: 1,
    explanation:
      "Arquiteturas multiagente permitem separar papéis e especializar etapas do processo.",
  },
];

const IA_SOFT_SKILLS_QUESTIONS: RecoveryQuestion[] = [
  {
    id: 201,
    category: "Soft Skills",
    text: "Ao usar IA para apoiar uma comunicação técnica com público não técnico, qual prática é mais adequada?",
    options: [
      "Usar o máximo de jargão possível",
      "Pedir uma versão clara, simples e adaptada ao público",
      "Copiar a resposta da IA sem revisar",
      "Remover todo o contexto da solicitação",
    ],
    correct: 1,
    explanation:
      "Comunicação eficaz exige adaptação ao público, clareza e revisão humana.",
  },
  {
    id: 202,
    category: "Ferramentas",
    text: "Qual uso da IA é mais adequado em refatoração de código?",
    options: [
      "Aplicar tudo automaticamente sem testar",
      "Usar IA para sugerir melhorias e validar com testes",
      "Apagar o código original",
      "Ignorar legibilidade",
    ],
    correct: 1,
    explanation:
      "A IA pode acelerar a refatoração, mas a validação técnica continua indispensável.",
  },
  {
    id: 203,
    category: "Ferramentas",
    text: "Como a IA pode apoiar a documentação técnica?",
    options: [
      "Gerando um rascunho inicial a partir do contexto fornecido",
      "Substituindo a necessidade de revisão",
      "Removendo detalhes do sistema",
      "Eliminando padrões de qualidade",
    ],
    correct: 0,
    explanation:
      "IA é útil para iniciar documentação, estruturar conteúdo e acelerar a primeira versão.",
  },
  {
    id: 204,
    category: "Soft Skills",
    text: "Qual comportamento mais fortalece colaboração em equipe ao usar IA?",
    options: [
      "Tratar a resposta da IA como decisão final",
      "Usar a IA como apoio e validar em conjunto com o time",
      "Evitar feedback humano para ganhar tempo",
      "Esconder as premissas usadas no prompt",
    ],
    correct: 1,
    explanation:
      "IA deve atuar como apoio, com validação humana, alinhamento e senso crítico.",
  },
  {
    id: 205,
    category: "Ferramentas",
    text: "Qual é um bom uso da IA no processo de testes?",
    options: [
      "Ignorar cenários de borda",
      "Pedir sugestões de casos de teste e revisar a cobertura",
      "Executar deploy direto em produção",
      "Remover testes existentes",
    ],
    correct: 1,
    explanation:
      "IA pode ajudar a ampliar cobertura e gerar ideias de teste, mas a revisão é necessária.",
  },
  {
    id: 206,
    category: "Soft Skills",
    text: "Na gestão do tempo com apoio de IA, qual prática tende a funcionar melhor?",
    options: [
      "Pedir qualquer lista de tarefas sem prioridade",
      "Usar a IA para organizar prioridades, esforço e próximos passos",
      "Executar demandas sem revisar o plano",
      "Trocar foco por velocidade a qualquer custo",
    ],
    correct: 1,
    explanation:
      "A IA pode apoiar priorização e clareza de execução quando recebe contexto suficiente.",
  },
  {
    id: 207,
    category: "Ética",
    text: "Qual atitude é mais adequada ao usar IA para escrever feedback profissional?",
    options: [
      "Enviar sem ler",
      "Revisar tom, precisão e contexto antes de compartilhar",
      "Deixar a IA decidir sozinha sobre pessoas",
      "Aumentar o tom crítico para parecer mais firme",
    ],
    correct: 1,
    explanation:
      "Feedback mediado por IA exige revisão humana de tom, contexto e impacto.",
  },
  {
    id: 208,
    category: "Soft Skills",
    text: "O que melhor representa pensamento crítico ao usar IA?",
    options: [
      "Aceitar a primeira resposta sempre",
      "Questionar premissas, validar fatos e revisar a adequação da resposta",
      "Usar só respostas longas",
      "Evitar comparação entre alternativas",
    ],
    correct: 1,
    explanation:
      "Pensamento crítico envolve verificação, análise e avaliação da resposta gerada.",
  },
  {
    id: 209,
    category: "Ferramentas",
    text: "Qual uso da IA mais ajuda no debug com análise de logs?",
    options: [
      "Enviar logs sem contexto e esperar solução definitiva",
      "Fornecer contexto do erro e pedir hipóteses de causa e passos de investigação",
      "Apagar os logs antes de analisar",
      "Substituir monitoramento por prompts",
    ],
    correct: 1,
    explanation:
      "Logs com contexto permitem que a IA ajude a estruturar hipóteses e investigação.",
  },
  {
    id: 210,
    category: "Soft Skills",
    text: "Em storytelling para apresentação técnica, qual uso da IA tende a ser mais útil?",
    options: [
      "Gerar slides sem objetivo",
      "Estruturar narrativa com problema, solução, impacto e próximos passos",
      "Trocar dados por frases genéricas",
      "Evitar adaptação ao público",
    ],
    correct: 1,
    explanation:
      "Uma boa narrativa técnica tem objetivo, estrutura e adequação ao público.",
  },
];

const IA_GENERATIVA_PROMPT_CHALLENGE: PromptChallengeDefinition = {
  id: "gen-rag-01",
  course: "ia-generativa",
  title: "Desafio prático · Prompt para assistente com contexto recuperado",
  intro:
    "Neste desafio, você não vai programar uma função. Você vai escrever um prompt técnico, com instruções claras e verificáveis.",
  scenario:
    "Você precisa orientar um assistente de IA que responde dúvidas de alunos usando trechos recuperados de uma base documental interna do curso. O modelo só pode responder com base no contexto recebido na entrada.",
  instructions: [
    "Escreva um prompt completo para esse assistente.",
    "O texto deve deixar claro o papel do assistente, a tarefa, as restrições e o formato esperado da resposta.",
    "O prompt deve ser utilizável em um sistema real, sem depender de interpretação implícita.",
  ],
  requiredItems: [
    "usar apenas o contexto fornecido",
    "se a informação não estiver no contexto",
    "não invente informações",
    "responda em tópicos",
    "cite a fonte",
    "máximo de 5 linhas",
  ],
  bonusItems: [
    "tom claro e objetivo",
    "priorize precisão",
    "indique quando houver ambiguidade",
  ],
  minimumRequiredToPass: 5,
  placeholder:
    "Ex.: Papel: você é um assistente...\nObjetivo: responder dúvidas...\nRestrições: use apenas...\nFormato de saída: ...",
};

const IA_SOFT_SKILLS_PROMPT_CHALLENGE: PromptChallengeDefinition = {
  id: "soft-feedback-01",
  course: "ia-soft-skills",
  title: "Desafio prático · Prompt para feedback técnico construtivo",
  intro:
    "Neste desafio, você vai escrever um prompt para orientar uma IA a transformar observações técnicas em feedback profissional.",
  scenario:
    "Você quer usar IA para converter comentários técnicos brutos de revisão de código em uma mensagem respeitosa, clara e útil para a pessoa desenvolvedora.",
  instructions: [
    "Escreva um prompt completo para essa tarefa.",
    "O prompt deve orientar a IA a manter clareza, respeito e foco em melhoria contínua.",
    "A resposta esperada da IA deve ter uma estrutura objetiva e aplicável em contexto profissional.",
  ],
  requiredItems: [
    "tom respeitoso",
    "linguagem clara",
    "pontos fortes",
    "oportunidades de melhoria",
    "próximos passos",
    "evite linguagem agressiva",
  ],
  bonusItems: [
    "considere o contexto do público",
    "seja objetivo",
    "mantenha empatia",
  ],
  minimumRequiredToPass: 5,
  placeholder:
    "Ex.: Contexto: você receberá comentários técnicos...\nTarefa: reescrever...\nTom: respeitoso...\nFormato de saída: ...",
};

export const COURSE_CONTENT: Record<CourseTrack, CourseContentDefinition> = {
  "ia-generativa": {
    title: "IA Generativa",
    studyTitle: "Guia de estudos · IA Generativa",
    studyIntro:
      "Revise os conceitos que mais caem na prova e os elementos que fazem a diferença no desafio prático de escrita de prompt.",
    studyTopics: [
      {
        title: "Fundamentos de IA Generativa",
        summary:
          "Modelos de linguagem funcionam prevendo padrões — entender isso muda como você escreve instruções.",
        bullets: [
          'LLMs geram texto com base em probabilidade, não "entendimento"',
          "Contexto claro produz respostas melhores e mais previsíveis",
          "IA generativa não substitui revisão e validação humana",
          "Instruções vagas = resultados imprevisíveis",
        ],
        example: [
          "Comparação direta:",
          'Ruim → "Explique IA"',
          'Bom → "Explique IA generativa para iniciantes em 4 tópicos com um exemplo do dia a dia"',
        ],
      },
      {
        title: "APIs, integrações e automação",
        summary:
          "Integrar IA com APIs e automações exige boas práticas de segurança e tratamento de falhas.",
        bullets: [
          "Chaves de API pertencem ao backend — nunca ao frontend",
          "Sempre trate erros, timeouts e respostas inesperadas",
          "Webhooks disparam ações em tempo real a partir de eventos",
          "Workflows encadeiam ferramentas, dados e etapas do processo",
        ],
        example: [
          "Fluxo típico:",
          "Formulário recebido → webhook dispara → API consultada → IA gera resposta → resposta entregue",
        ],
      },
      {
        title: "RAG, embeddings e recuperação",
        summary:
          'RAG e embeddings controlam o que o modelo "sabe" na hora de responder — essencial para precisão.',
        bullets: [
          "Embeddings convertem texto em vetores comparáveis",
          "RAG recupera trechos relevantes antes de gerar a resposta",
          "O modelo deve responder com base só no contexto fornecido",
          "Restrições explícitas no prompt reduzem alucinações",
        ],
        example: [
          "Regra útil de prompt:",
          '"Use apenas o contexto abaixo. Se não houver base suficiente, diga isso claramente."',
        ],
      },
      {
        title: "Agentes e multiagentes",
        summary:
          "Agentes executam objetivos de forma autônoma — mas ainda precisam de supervisão humana.",
        bullets: [
          "Agente recebe um objetivo e decide quais ações executar",
          "Pode consultar APIs, bancos de dados e outras ferramentas",
          "Multiagentes dividem responsabilidades por especialidade",
          "Autonomia maior exige validação mais rigorosa",
        ],
        example: [
          "Pipeline multiagente:",
          "Agente 1 → recupera documentos relevantes",
          "Agente 2 → resume e estrutura a resposta",
          "Agente 3 → valida formato e consistência final",
        ],
      },
    ],
    challengeStudyTitle: "Como se preparar para o desafio",
    challengeStudyIntro:
      "No desafio, o que separa um prompt mediano de um excelente é clareza técnica, restrições bem definidas e formato de saída especificado.",
    challengeTips: [
      'Comece definindo o papel do assistente ("Você é um especialista em...").',
      "Use um verbo de ação claro para descrever a tarefa principal.",
      "Instrua explicitamente a usar apenas o contexto fornecido.",
      "Inclua uma regra de fallback para quando faltar informação.",
      "Defina o formato de saída: tópicos, limite de linhas, indicação de fonte.",
      "Releia o prompt como se fosse o modelo — está claro o que fazer?",
    ],
    finalChecklist: [
      "Entendo como LLMs geram texto e por que contexto importa",
      "Sei o que são embeddings, RAG e recuperação de contexto",
      "Conheço boas práticas de integração com APIs e webhooks",
      "Meu prompt do desafio tem papel, tarefa, restrições e formato",
      "Não deixei margem para o modelo inventar informação",
    ],
    recoveryQuestions: IA_GENERATIVA_QUESTIONS,
    promptChallenge: IA_GENERATIVA_PROMPT_CHALLENGE,
  },
  "ia-soft-skills": {
    title: "IA + Soft Skills",
    studyTitle: "Guia de estudos · IA + Soft Skills",
    studyIntro:
      "Revise os tópicos que combinam uso de IA com comunicação profissional — os dois pilares desta trilha.",
    studyTopics: [
      {
        title: "Fundamentos e impacto da IA no trabalho",
        summary:
          "IA aumenta produtividade, mas a responsabilidade pelas decisões continua sendo humana.",
        bullets: [
          "IA apoia — não substitui — julgamento e responsabilidade",
          "Sempre revise precisão, contexto e impacto das saídas",
          "Ferramentas de IA ajudam em escrita, análise e planejamento",
          "Uso responsável exige ética, privacidade e senso crítico",
        ],
        example: [
          "Princípio chave:",
          "Usar IA para rascunhar uma tarefa é válido — a decisão e a revisão final são sempre suas.",
        ],
      },
      {
        title: "IA para desenvolvimento",
        summary:
          "IA pode acelerar código, documentação, testes e debug — desde que você saiba direcionar bem.",
        bullets: [
          "IA sugere refatorações, mas você valida a lógica",
          "Gera rascunhos de documentação que você revisa e ajusta",
          "Ajuda a pensar em casos de teste e cenários extremos",
          "Apoia análise inicial de logs — não substitui investigação técnica",
        ],
        example: [
          "Prompt eficiente para debug:",
          '"Analise este log, proponha 3 hipóteses de causa e sugira próximos passos de investigação."',
        ],
      },
      {
        title: "Comunicação, colaboração e feedback",
        summary:
          "Comunicar bem e dar feedback construtivo são habilidades que a IA pode apoiar — mas não executar por você.",
        bullets: [
          "Adapte a linguagem ao público e ao contexto",
          "Feedback precisa equilibrar objetividade e respeito",
          "IA apoia a estrutura da comunicação, não o relacionamento",
          "Tom e contexto importam tanto quanto o conteúdo em si",
        ],
        example: [
          "Transformação com IA:",
          "Entrada → crítica bruta e direta demais",
          "Saída → feedback com pontos fortes, oportunidades e próximos passos",
        ],
      },
      {
        title: "Pensamento crítico e produtividade",
        summary:
          "Saber usar IA para organizar o trabalho sem perder o pensamento crítico é o diferencial desta trilha.",
        bullets: [
          "Questione sempre a primeira resposta da IA",
          "Valide fatos e adequação ao contexto antes de usar",
          "Use IA para priorizar tarefas e estruturar comunicação",
          "Bom storytelling técnico tem clareza, sequência e objetivo",
        ],
        example: [
          "Estrutura útil para qualquer entrega:",
          "Problema → análise → solução → impacto esperado → próximos passos",
        ],
      },
    ],
    challengeStudyTitle: "Como se preparar para o desafio",
    challengeStudyIntro:
      "No desafio, você precisa escrever um prompt que transforme observações técnicas em feedback profissional de alta qualidade.",
    challengeTips: [
      "Defina que o tom deve ser profissional, respeitoso e direto.",
      "Peça linguagem clara, sem agressividade ou ambiguidade.",
      "Exija estrutura com pontos fortes, melhorias e próximos passos.",
      "Indique que a resposta deve considerar público e contexto.",
      'Nunca use prompts genéricos como "melhore esse texto".',
      "Especifique o formato de saída esperado antes de enviar.",
    ],
    finalChecklist: [
      "Conheço usos práticos de IA em código, testes e documentação",
      "Sei adaptar comunicação ao público e ao contexto",
      "Entendo que feedback bom une objetividade e respeito",
      "Uso pensamento crítico: IA apoia, não decide",
      "Meu prompt do desafio tem tom, estrutura e próximos passos",
    ],
    recoveryQuestions: IA_SOFT_SKILLS_QUESTIONS,
    promptChallenge: IA_SOFT_SKILLS_PROMPT_CHALLENGE,
  },
};
