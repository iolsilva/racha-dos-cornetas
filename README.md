# Racha Manager

Sistema completo para gestao do futebol semanal com:

- controle financeiro mensal
- cadastro de jogadores fixos, goleiros e diaristas
- confirmacao de presenca
- montagem de times azul x vermelho
- historico de partidas
- ranking anual com desempate por vitorias, empates e jogos

## Stack

- `Next.js` App Router
- `Tailwind CSS`
- `Supabase Auth`
- `PostgreSQL` no Supabase
- `Vercel`

## Estrutura principal

```text
.
|-- docs/
|-- supabase/
|   `-- schema.sql
|-- src/
|   |-- app/
|   |-- components/
|   |-- lib/
|   `-- server/
|-- .env.example
`-- package.json
```

## Fases entregues

1. Fundacao do app com App Router, tema premium, auth SSR e shell responsivo.
2. Banco completo com modelagem, funcoes, ranking, relatorios e RLS.
3. Fluxos admin para jogadores, pagamentos, despesas, partidas, escalacao e placar.
4. Fluxos jogador para dashboard, financeiro, jogos, ranking e perfil.
5. Documentacao de deploy, checklist final e comandos de operacao.

## Variaveis de ambiente

Crie `.env.local` com base em `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Subindo localmente

```bash
npm install
npm run dev
```

## SQL

Execute [`supabase/schema.sql`](./supabase/schema.sql) no SQL Editor do Supabase.

## Documentacao complementar

- [Arquitetura](./docs/architecture.md)
- [Deploy na Vercel](./docs/deploy-vercel.md)
- [Checklist final](./docs/checklist.md)
