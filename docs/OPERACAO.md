# Operacao Fluxozap

## Venda

Posicionamento: painel white-label para agencias venderem bots de WhatsApp sem expor ferramentas tecnicas ao cliente final.

Planos sugeridos:

- Starter: ate 10 clientes / 10 instancias.
- Growth: ate 50 clientes / 50 instancias.
- Scale: limites negociados e operacao dedicada.

## Implantacao

1. Configure `.env`.
2. Rode `npm install`.
3. Rode `npm run db:migrate`.
4. Rode `npm run db:generate`.
5. Crie o primeiro admin:

```bash
$env:ADMIN_EMAIL="admin@seudominio.com"
$env:ADMIN_PASSWORD="senha-forte"
npm run admin:create
```

6. Configure Evolution e Typebot no painel.
7. Configure o webhook da Evolution para:

```text
https://seu-dominio.com/api/evolution/webhook
```

Se `EVOLUTION_WEBHOOK_SECRET` estiver definido, envie o header:

```text
x-fluxozap-secret: seu-segredo
```

## Onboarding de agencia

1. Agencia solicita acesso.
2. SUPER_ADMIN aprova a conta.
3. Admin ajusta plano e limites em `/dashboard/admin/agencies`.
4. Agencia configura marca e email financeiro em `/dashboard/settings`.
5. Agencia configura Evolution e o motor do Construtor Fluxozap em `/dashboard/settings/integrations`.
6. Agencia cadastra clientes e cria fluxos no construtor visual embutido.
7. Agencia cria o vinculo cliente + fluxo + instancia.
8. Para API propria, agencia clica em `Provisionar bot` para criar/atualizar o bot dentro da Evolution API.

## Checklist de entrega para cliente da agencia

- Cliente cadastrado com numero WhatsApp correto.
- Instancia Evolution conectada.
- Fluxo criado no Construtor Fluxozap.
- Vinculo ativo em `/dashboard/links`.
- WhatsApp/instancia conectados.
- Sessao aparecendo em `/dashboard/sessions` apos primeira mensagem.

## Mascaramento do motor visual

O Fluxozap usa o Typebot como motor de construcao, mas a interface visivel do painel chama isso de `Construtor Fluxozap`.

Para mascarar melhor:

- Use uma instalacao propria do Typebot.
- Configure `TYPEBOT_BASE_URL` apontando para essa instalacao.
- Use `TYPEBOT_EDITOR_TEMPLATE="/_fluxo-builder/typebots/{{typebotId}}"`.
- O Next.js faz rewrite de `/_fluxo-builder/*` para o `TYPEBOT_BASE_URL`.

Observacao honesta: nenhum iframe/proxy simples garante invisibilidade absoluta em DevTools. Para vender com marca propria, o ideal e usar Typebot self-hosted com dominio seu, remover marcas no tema/build quando necessario e servir o editor pelo proxy interno.

## Seu chatbot atual

O Fluxozap tambem pode provisionar a integracao nativa `EvolutionBot` da Evolution API para casos em que voce queira vender sua API propria em vez do construtor visual.

Endpoints usados:

- `POST /evolutionBot/create/:instanceName`
- `PUT /evolutionBot/update/:evolutionBotId/:instanceName`

Payload principal:

- `apiUrl`: endpoint do seu chatbot vendido hoje.
- `apiKey`: chave usada no header `Authorization: Bearer`.
- `triggerType`: `all`, `keyword`, `none` ou `advanced`.
- configuracoes de sessao: `keepOpen`, `stopBotFromMe`, `debounceTime`, `splitMessages`.

## Deploy

Healthcheck:

```text
/api/health
```

Docker:

```bash
docker build -t fluxozap .
docker run -p 3000:3000 --env-file .env fluxozap
```

Railway:

- O arquivo `railway.json` usa o `Dockerfile`.
- Configure as variaveis do `.env.example`.
- Rode `npm run db:migrate` uma vez no ambiente com acesso ao banco.
