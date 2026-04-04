# Painel Escolar · Geração Tech

Sistema escolar com portal do aluno e painel administrativo, refatorado em React + TypeScript + Tailwind CSS e integrado diretamente ao Supabase.

## O que o projeto entrega

- Portal do aluno com:
  - login por perfil
  - quiz principal
  - prova de recuperação
  - desafio de presença com regra explicada de forma objetiva
  - guia de estudos
- Painel administrativo com:
  - dashboard visual com indicadores rápidos
  - gestão de alunos
  - gestão de turmas
  - gestão de disciplinas
  - lançamento e visualização de notas
  - lançamento e visualização de frequência
  - resultados consolidados
- Persistência 100% no Supabase, sem uso de `localStorage`
- Frontend pronto para deploy no Vercel

## Stack utilizada

- **React 18**: construção da interface e composição de componentes.
- **TypeScript**: tipagem estática e segurança de manutenção.
- **Vite**: ambiente de desenvolvimento rápido e build de produção.
- **Tailwind CSS**: estilização utilitária e aplicação do design system.
- **DM Sans + Space Mono**: tipografia principal e tipografia mono do sistema.
- **Supabase (PostgREST + PostgreSQL)**: banco de dados e persistência dos dados acadêmicos.
- **Vercel**: hospedagem do frontend SPA.

## Pré-requisitos

- Node.js 18+
- npm 9+
- Um projeto Supabase criado
- Acesso ao SQL Editor do Supabase

## Configuração do Supabase

1. Abra o projeto Supabase.
2. Vá em **SQL Editor**.
3. Execute o arquivo `supabase/schema.sql`.
4. Copie a **Project URL** e a **anon key** em **Settings > API**.

## Variáveis de ambiente

O projeto usa estas variáveis:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_DEFAULT_ADMIN_EMAILS` (opcional)

Crie `client/.env` a partir de `client/.env.example`:

```bash
cp client/.env.example client/.env
```

Exemplo:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_DEFAULT_ADMIN_EMAILS=admin@escola.local,coordenacao@escola.com
```

## Como rodar localmente

1. Instale as dependências do frontend:

```bash
cd client
npm install
```

2. Configure o arquivo `client/.env` com as variáveis do Supabase.

3. Execute o projeto:

```bash
npm run dev
```

4. Acesse o endereço exibido pelo Vite, normalmente:

```bash
http://localhost:5173
```

## Checagem de qualidade

TypeScript:

```bash
cd client
npm run typecheck
```

Build de produção:

```bash
cd client
npm run build
```

## Deploy

### Preciso usar Render + Vercel?

**Não. Neste refactor, apenas o Vercel é suficiente.**

Motivo:

- o frontend fala direto com o Supabase via API REST do próprio Supabase
- o banco e a persistência já estão no Supabase
- não existe mais dependência operacional de um backend Node/Express para o fluxo principal do projeto

### Quando Render faria sentido?

Só faria sentido se você quisesse manter um backend próprio para:

- autenticação customizada com segredo privado
- regras de negócio críticas no servidor
- jobs agendados
- integrações que exigem chaves sigilosas fora do frontend

Para o projeto entregue aqui, **Vercel + Supabase** resolve o deploy.

### Passo a passo de deploy no Vercel

1. Suba o repositório para GitHub/GitLab/Bitbucket.
2. No Vercel, crie um novo projeto apontando para a pasta raiz do repositório.
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Adicione no Vercel as mesmas variáveis:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_DEFAULT_ADMIN_EMAILS` (opcional)
5. Faça o deploy.

Como o arquivo `client/vercel.json` já contém rewrite para SPA, o roteamento funciona corretamente.

## Estrutura de pastas

```text
ia-project/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/       # header, toasts, modal, editor e UI compartilhada
│   │   ├── data/             # conteúdo das trilhas, questões e constantes
│   │   ├── hooks/            # estado global da aplicação e toasts
│   │   ├── lib/              # cliente REST do Supabase
│   │   ├── screens/          # telas do aluno e do admin
│   │   ├── utils/            # helpers e camada de dados
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── vercel.json
├── server/                   # legado do projeto anterior; não é necessário para este deploy
├── supabase/
│   └── schema.sql            # schema completo usado pelo frontend atual
├── package.json              # atalhos para dev/build do frontend
└── README.md
```

## Observações importantes

- O projeto foi ajustado para **não usar localStorage** em persistência.
- A lógica da **prova de recuperação** foi corrigida para não exibir nota parcial.
- O **desafio de presença** agora explica claramente:
  - frequência mínima exigida
  - limite máximo de faltas
  - impacto do desafio no resultado final do aluno
- O schema atual usa policies permissivas para facilitar desenvolvimento e homologação com frontend direto no Supabase. Antes de abrir o sistema ao público, vale endurecer as regras de RLS.
