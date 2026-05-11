# Fluxozap

SaaS white-label para agencias venderem e operarem chatbots de WhatsApp para seus clientes.

O cliente final nao acessa o painel. A agencia gerencia clientes, WhatsApp, fluxos no Construtor Fluxozap, integrações opcionais de API propria, vinculos e sessoes. O SUPER_ADMIN controla agencias, usuarios pendentes e suspensoes.

## Requisitos

- Node.js LTS
- PostgreSQL

## Scripts

- npm run dev
- npm run build
- npm run start
- npm run lint
- npm run format
- npm run db:generate
- npm run db:migrate
- npm run db:studio

## Ambiente

Copie .env.example para .env e ajuste DATABASE_URL.

Variaveis principais:

- DATABASE_URL: PostgreSQL usado pelo Prisma.
- APP_URL: URL publica/local do painel.
- AUTH_SECRET: segredo de autenticacao.
- EVOLUTION_BASE_URL e EVOLUTION_API_KEY: conexao com Evolution API.
- EVOLUTION_WEBHOOK_SECRET: segredo opcional para proteger /api/evolution/webhook.
- EVOLUTION_BOT_API_URL e EVOLUTION_BOT_API_KEY: API do chatbot que voce ja vende hoje.
- TYPEBOT_BASE_URL e TYPEBOT_EDITOR_TEMPLATE: URL do motor visual self-hosted e template interno com {{typebotId}}.

## Rotas principais

- /
- /dashboard
- /dashboard/clients
- /dashboard/instances
- /dashboard/flows
- /dashboard/links
- /dashboard/sessions
- /dashboard/admin/approvals
- /dashboard/admin/agencies

## Fluxo operacional

1. Primeira conta criada vira SUPER_ADMIN.
2. Novas agencias ficam pendentes ate aprovacao do SUPER_ADMIN.
3. A agencia cadastra clientes com 1 numero de WhatsApp por cliente.
4. A agencia cria 1 instancia Evolution por cliente e conecta via QR.
5. A agencia cria/edita fluxos no Construtor Fluxozap, com Typebot rodando por tras.
6. A agencia vincula cliente + fluxo + instancia para manter o bot ativo.
7. Webhooks da Evolution em /api/evolution/webhook registram sessoes basicas.

## Banco

Depois de ajustar o .env:

```bash
npm run db:migrate
npm run db:generate
```

Uma migration inicial esta em prisma/migrations.

## Criar admin global

```bash
$env:ADMIN_EMAIL="admin@seudominio.com"
$env:ADMIN_PASSWORD="senha-forte"
npm run admin:create
```

## Produto

- Material de operacao: docs/OPERACAO.md
- Roadmap comercial: docs/ROADMAP.md

## Estrutura

- src/app/(public)
- src/app/(app)
- src/server (db, auth, utils)
- src/modules (auth, agencies, clients, integrations)
