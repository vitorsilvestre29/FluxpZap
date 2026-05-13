import { requireUser } from '@/server/auth/context';
import { getFlows } from '@/server/data/flows';
import { getIntegration } from '@/server/integrations/integration.service';
import { getTypebotConfig } from '@/server/integrations/typebot-config';
import { buildTypebotEditorUrl, getDefaultTypebotEditorTemplate } from '@/server/integrations/typebot';

type PageProps = {
  searchParams?: { error?: string };
};

export default async function FlowsPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const agencyId = user.agencyId || '';
  const flows = agencyId ? await getFlows(agencyId) : [];
  const typebotIntegration = agencyId ? await getIntegration(agencyId, 'TYPEBOT') : null;
  const typebotConfig = agencyId ? await getTypebotConfig(agencyId) : null;
  const editorTemplate =
    typebotConfig?.editorTemplate ||
    (typebotIntegration?.metadata as { editorTemplate?: string } | null)?.editorTemplate ||
    getDefaultTypebotEditorTemplate(typebotIntegration?.baseUrl ?? process.env.TYPEBOT_BASE_URL);
  const hasTypebotSso = Boolean(process.env.TYPEBOT_BASE_URL && process.env.TYPEBOT_SSO_SECRET);
  const hasVisualEngine = Boolean(
    hasTypebotSso ||
      ((typebotIntegration?.baseUrl || process.env.TYPEBOT_BASE_URL) &&
        (typebotIntegration?.apiKey || process.env.TYPEBOT_API_KEY) &&
        ((typebotIntegration?.metadata as { workspaceId?: string } | null)?.workspaceId ||
          process.env.TYPEBOT_WORKSPACE_ID)),
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Fluxos</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Construtor Fluxozap</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Crie fluxos visuais para seus clientes sem expor ferramentas tecnicas da operacao.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            hasVisualEngine ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-200'
          }`}
        >
          {hasVisualEngine ? 'Motor visual conectado' : 'Motor visual pendente'}
        </span>
      </header>

      <section className="panel rounded-3xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Novo fluxo</h2>
            <p className="mt-1 text-sm text-slate-400">
              O Fluxozap cria o fluxo e prepara o construtor visual automaticamente.
            </p>
          </div>
        </div>
        {!hasVisualEngine && (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            Configure o motor visual em Integracoes para criar e editar fluxos dentro do Fluxozap.
          </div>
        )}
        {searchParams?.error && (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            {searchParams.error}
          </div>
        )}
        <form action="/api/flows" method="post" className="mt-5 grid gap-4">
          <input type="hidden" name="provider" value="TYPEBOT" />
          <input
            name="name"
            required
            placeholder="Nome do fluxo"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <textarea
            name="description"
            placeholder="Descricao para sua equipe"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            rows={3}
          />
          <button className="rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900">
            Criar fluxo
          </button>
        </form>
      </section>

      <section className="grid gap-4">
        {flows.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm text-slate-400">
            Nenhum fluxo criado.
          </div>
        )}
        {flows.map((flow) => {
          const editorUrl =
            flow.editorUrl ||
            (editorTemplate
              ? buildTypebotEditorUrl(
                  {
                    baseUrl: typebotIntegration?.baseUrl || process.env.TYPEBOT_BASE_URL || '',
                    editorTemplate,
                    maskedBasePath: '/fluxo-builder',
                  },
                  flow,
                )
              : null);
          const canOpenEditor = Boolean(editorUrl || hasTypebotSso);

          return (
            <article key={flow.id} className="grid gap-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{flow.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{flow.description ?? 'Sem descricao'}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Vinculos: {flow._count.links} · {canOpenEditor ? 'Construtor pronto' : 'Aguardando motor visual'}
                  </p>
                </div>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                  {flow.status}
                </span>
              </div>

              <form action="/api/flows" method="post" className="grid gap-3 md:grid-cols-2">
                <input type="hidden" name="flowId" value={flow.id} />
                <input type="hidden" name="provider" value={flow.provider} />
                <input type="hidden" name="typebotId" value={flow.typebotId ?? ''} />
                <input type="hidden" name="typebotPublicId" value={flow.typebotPublicId ?? ''} />
                <input type="hidden" name="typebotWorkspaceId" value={flow.typebotWorkspaceId ?? ''} />
                <input type="hidden" name="editorUrl" value={flow.editorUrl ?? ''} />
                <input type="hidden" name="publishedUrl" value={flow.publishedUrl ?? ''} />
                <input type="hidden" name="evolutionBotApiUrl" value={flow.evolutionBotApiUrl ?? ''} />
                <input type="hidden" name="evolutionBotApiKey" value={flow.evolutionBotApiKey ?? ''} />
                <input
                  name="name"
                  required
                  defaultValue={flow.name}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <select
                  name="status"
                  defaultValue={flow.status}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                >
                  <option value="DRAFT">Rascunho</option>
                  <option value="READY">Pronto</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="PAUSED">Pausado</option>
                </select>
                <textarea
                  name="description"
                  defaultValue={flow.description ?? ''}
                  rows={2}
                  placeholder="Descricao"
                  className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <details className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-200">Regras de atendimento</summary>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <select
                      name="triggerType"
                      defaultValue={flow.triggerType}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                    >
                      <option value="all">Todas as mensagens</option>
                      <option value="keyword">Palavra-chave</option>
                      <option value="none">Manual</option>
                      <option value="advanced">Avancado</option>
                    </select>
                    <input
                      name="triggerValue"
                      defaultValue={flow.triggerValue ?? ''}
                      placeholder="Palavra-chave ou gatilho"
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                    />
                    <input type="hidden" name="triggerOperator" value={flow.triggerOperator ?? 'contains'} />
                    <input type="hidden" name="debounceTime" value={flow.debounceTime} />
                    <input type="hidden" name="delayMessage" value={flow.delayMessage} />
                    <input type="hidden" name="timePerChar" value={flow.timePerChar} />
                    <input
                      name="keywordFinish"
                      defaultValue={flow.keywordFinish}
                      placeholder="Palavra para encerrar"
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                    />
                    <input
                      name="expire"
                      type="number"
                      defaultValue={flow.expire}
                      placeholder="Expiracao em segundos"
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                    />
                    <input
                      name="unknownMessage"
                      defaultValue={flow.unknownMessage}
                      placeholder="Mensagem padrao"
                      className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input name="keepOpen" type="checkbox" defaultChecked={flow.keepOpen} />
                      Manter sessao aberta
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input name="stopBotFromMe" type="checkbox" defaultChecked={flow.stopBotFromMe} />
                      Pausar quando um humano responder
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input name="listeningFromMe" type="checkbox" defaultChecked={flow.listeningFromMe} />
                      Considerar mensagens enviadas pela equipe
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input name="splitMessages" type="checkbox" defaultChecked={flow.splitMessages} />
                      Dividir respostas longas
                    </label>
                  </div>
                </details>
                <button className="rounded-full border border-cyan-400/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-100">
                  Salvar
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-3">
                {canOpenEditor ? (
                  <a
                    className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900"
                    href={`/dashboard/flows/${flow.id}/editor`}
                  >
                    Abrir construtor
                  </a>
                ) : (
                  <form action="/api/flows/provision" method="post">
                    <input type="hidden" name="flowId" value={flow.id} />
                    <button className="rounded-full border border-amber-400/30 px-4 py-2 text-xs text-amber-200">
                      Preparar construtor
                    </button>
                  </form>
                )}
                <form action="/api/flows/status" method="post">
                  <input type="hidden" name="flowId" value={flow.id} />
                  <input type="hidden" name="status" value={flow.status === 'PUBLISHED' ? 'PAUSED' : 'PUBLISHED'} />
                  <button className="rounded-full border border-emerald-400/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-100">
                    {flow.status === 'PUBLISHED' ? 'Pausar' : 'Publicar'}
                  </button>
                </form>
                <form action="/api/flows/delete" method="post">
                  <input type="hidden" name="flowId" value={flow.id} />
                  <button className="rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                    Remover
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
