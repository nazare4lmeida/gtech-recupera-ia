import { Challenge, CodeChallenge, Question } from '../types'

export const QUESTIONS: Question[] = [
  {
    id: 1,
    order: 1,
    difficulty: 'beginner',
    category: 'prompting',
    text: 'Qual característica torna um prompt mais útil para um modelo generativo?',
    options: [
      'Ser vago para deixar o modelo livre',
      'Trazer contexto, objetivo e formato esperado',
      'Usar apenas palavras-chave soltas',
      'Ter o maior número possível de emojis',
    ],
    correct: 1,
    feedbackOk:
      '<strong>Correto!</strong> Bons prompts costumam informar contexto, objetivo, público e formato de saída.',
    feedbackNok:
      '<strong>Quase!</strong> Quanto mais claro o contexto e o formato esperado, melhor tende a ser a resposta.',
  },
  {
    id: 2,
    order: 2,
    difficulty: 'beginner+',
    category: 'ferramentas',
    text: 'Ao usar IA generativa no trabalho, qual prática ajuda mais a reduzir retrabalho?',
    options: [
      'Pedir tudo do zero em cada interação',
      'Salvar prompts úteis e iterar versões',
      'Evitar revisar a resposta gerada',
      'Copiar qualquer saída sem checagem',
    ],
    correct: 1,
    feedbackOk:
      '<strong>Correto!</strong> Versionar prompts e iterar respostas acelera a rotina e melhora a consistência.',
    feedbackNok:
      '<strong>Quase!</strong> Criar um repertório de prompts reutilizáveis reduz retrabalho e aumenta produtividade.',
  },
  {
    id: 3,
    order: 3,
    difficulty: 'intermediate',
    category: 'etica',
    text: 'Qual é a atitude mais adequada ao usar IA com dados sensíveis de clientes?',
    options: [
      'Enviar tudo diretamente para ganhar velocidade',
      'Remover ou anonimizar dados antes do uso',
      'Compartilhar a conversa com qualquer colega',
      'Ignorar política interna se o prazo estiver curto',
    ],
    correct: 1,
    feedbackOk:
      '<strong>Correto!</strong> Dados sensíveis devem ser minimizados, anonimizados e tratados conforme política da organização.',
    feedbackNok:
      '<strong>Quase!</strong> O uso responsável de IA exige cuidado com privacidade, compliance e minimização de dados.',
  },
  {
    id: 4,
    order: 4,
    difficulty: 'intermediate',
    category: 'colaboracao',
    text: 'Em um fluxo com IA + soft skills, o que mais fortalece a colaboração entre pessoas e ferramenta?',
    options: [
      'Tratar a resposta da IA como decisão final',
      'Usar a IA para rascunhar e validar em equipe antes de publicar',
      'Eliminar feedback humano para ganhar tempo',
      'Evitar registrar premissas e critérios',
    ],
    correct: 1,
    feedbackOk:
      '<strong>Correto!</strong> A IA funciona melhor como copiloto: rascunha, acelera e apoia decisões revisadas por pessoas.',
    feedbackNok:
      '<strong>Quase!</strong> Colaboração forte combina apoio da IA com revisão, alinhamento e senso crítico do time.',
  },
  {
    id: 5,
    order: 5,
    difficulty: 'hard',
    category: 'prompting',
    text: 'Qual prompt tende a gerar uma resposta mais previsível e útil?',
    options: [
      'Fale sobre liderança.',
      'Explique liderança para um time júnior em 5 tópicos, com exemplos práticos e tom objetivo.',
      'Escreva qualquer coisa sobre equipes.',
      'Me surpreenda sem contexto.',
    ],
    correct: 1,
    feedbackOk:
      '<strong>Correto!</strong> Especificidade sobre público, formato, quantidade e tom reduz ambiguidade e melhora a saída.',
    feedbackNok:
      '<strong>Quase!</strong> O prompt mais forte delimita público, objetivo, formato e tom da resposta.',
  },
]

export const CODE_CHALLENGE: CodeChallenge = {
  functionName: 'gerarResumoIA',
  statement:
    'Crie uma função em JavaScript chamada <strong>gerarResumoIA</strong> que recebe um tema (string) e retorna exatamente a frase <code>Resumo sobre [tema] com foco em clareza e ação.</code>.',
  tests: [
    {
      input: 'atendimento',
      expected: 'Resumo sobre atendimento com foco em clareza e ação.',
      label: 'gerarResumoIA("atendimento")',
    },
    {
      input: 'prompt engineering',
      expected: 'Resumo sobre prompt engineering com foco em clareza e ação.',
      label: 'gerarResumoIA("prompt engineering")',
    },
    {
      input: 'feedback',
      expected: 'Resumo sobre feedback com foco em clareza e ação.',
      label: 'gerarResumoIA("feedback")',
    },
  ],
}

export const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: 'Trilha IA Generativa',
    desc: 'Prompting, ferramentas, ética e comunicação aplicada.',
    layout: 1,
    active: true,
  },
  {
    id: 2,
    title: 'Trilha IA + Soft Skills',
    desc: 'Uso responsável, colaboração e produtividade com IA.',
    layout: 2,
    active: true,
  },
  {
    id: 3,
    title: 'Trilha aplicada',
    desc: 'Cenários práticos com foco em clareza e tomada de decisão.',
    layout: 3,
    active: true,
  },
]

export const DEFAULT_APPROVAL_THRESHOLD = 60
