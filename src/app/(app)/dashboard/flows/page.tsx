import { requireUser } from '@/server/auth/context';
import { getFlows } from '@/server/data/flows';
import { getIntegration } from '@/server/integrations/integration.service';
import { buildTypebotEditorUrl, getDefaultTypebotEditorTemplate } from '@/server/integrations/typebot';

type PageProps = {
  searchParams?: { error?: string };
};

export default async function FlowsPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const agencyId = user.agencyId || '';
  const flows = agencyId ? await getFlows(agencyId) : [];
  const typebotIntegration = agencyId ? await getIntegration(agencyId, 'TYPEBOT') : null;
  const editorTemplate =
    (typebotIntegration?.metadata as { editorTemplate?: string } | null)?.editorTemplate ||
    process.env.TYPEBOT_EDITOR_TEMPLATE ||
    getDefaultTypebotEditorTemplate(typebotIntegration?.baseUrl ?? process.env.TYPEBOT_BASE_URL);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Fluxos</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Construtor visual</h1>
      </header>

      <section className="panel rounded-3xl p-6">
        <h2 className="text-sm font-semibold text-white">Novo fluxo</h2>
        {!editorTemplate && (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            Configure o motor visual em Integracoes para abrir o construtor embutido.
          </div>
        )}
        {searchParams?.error && (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            {searchParams.error}
          </div>
        )}
        <form action="/api/flows" method="post" className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            name="name"
            required
            placeholder="Nome do fluxo"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <select
            name="provider"
            defaultValue="TYPEBOT"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          >
            <option value="TYPEBOT">Construtor visual</option>
            <option value="EVOLUTION_BOT">API propria</option>
          </select>
          <input
            name="evolutionBotApiUrl"
            defaultValue={process.env.EVOLUTION_BOT_API_URL ?? ''}
            placeholder="URL da API propria (opcional)"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            name="evolutionBotApiKey"
            defaultValue={process.env.EVOLUTION_BOT_API_KEY ?? ''}
            placeholder="Chave da API propria (opcional)"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            name="typebotId"
            placeholder="Typebot ID (opcional)"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            name="publishedUrl"
            placeholder="URL publicada do Typebot"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <textarea
            name="description"
            placeholder="Descricao"
            className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            rows={3}
          />
          <button className="md:col-span-2 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900">
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
          const editorUrl = flow.editorUrl || (editorTemplate
            ? buildTypebotEditorUrl({
                baseUrl: typebotIntegration?.baseUrl || process.env.TYPEBOT_BASE_URL || '',
                editorTemplate,
                maskedBasePath: '/_fluxo-builder',
              }, flow)
            : null);

          return (
            <div
              key={flow.id}
            className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4"
          >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                <p className="text-sm font-semibold text-white">{flow.name}</p>
                <p className="text-xs text-slate-400">{flow.description ?? 'Sem descricao'}</p>
                <p className="text-xs text-slate-500">
                  {flow.provider === 'TYPEBOT' ? 'Construtor visual' : 'API propria'} · Vinculos: {flow._count.links}
                  {flow.evolutionBotId ? ` · EvolutionBot: ${flow.evolutionBotId}` : ''}
                </p>
                </div>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                  {flow.status}
                </span>
              </div>
              <form action="/api/flows" method="post" className="grid gap-3 md:grid-cols-2">
                <input type="hidden" name="flowId" value={flow.id} />
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
                <select
                  name="provider"
                  defaultValue={flow.provider}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                >
                  <option value="TYPEBOT">Construtor visual</option>
                  <option value="EVOLUTION_BOT">API propria</option>
                </select>
                <input
                  name="evolutionBotApiUrl"
                  defaultValue={flow.evolutionBotApiUrl ?? process.env.EVOLUTION_BOT_API_URL ?? ''}
                  placeholder="URL da API propria"
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <input
                  name="evolutionBotApiKey"
                  defaultValue={flow.evolutionBotApiKey ?? process.env.EVOLUTION_BOT_API_KEY ?? ''}
                  placeholder="Chave da API propria"
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
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
                <select
                  name="triggerOperator"
                  defaultValue={flow.triggerOperator ?? 'contains'}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                >
                  <option value="contains">Contem</option>
                  <option value="equals">Igual</option>
                  <option value="startsWith">Comeca com</option>
                  <option value="endsWith">Termina com</option>
                  <option value="regex">Regex</option>
                </select>
                <input
                  name="triggerValue"
                  defaultValue={flow.triggerValue ?? ''}
                  placeholder="Gatilho (opcional)"
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <input
                  name="typebotId"
                  defaultValue={flow.typebotId ?? ''}
                  placeholder="Typebot ID"
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <input
                  name="typebotWorkspaceId"
                  defaultValue={flow.typebotWorkspaceId ?? ''}
                  placeholder="Workspace ID"
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <input
                  name="editorUrl"
                  defaultValue={flow.editorUrl ?? ''}
                  placeholder="URL direta do editor"
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <input
                  name="publishedUrl"
                  defaultValue={flow.publishedUrl ?? ''}
                  placeholder="URL publicada"
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <textarea
                  name="description"
                  defaultValue={flow.description ?? ''}
                  rows={2}
                  className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <div className="md:col-span-2 grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 md:grid-cols-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input name="keepOpen" type="checkbox" defaultChecked={flow.keepOpen} />
                    Manter sessao
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input name="stopBotFromMe" type="checkbox" defaultChecked={flow.stopBotFromMe} />
                    Pausar quando eu responder
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input name="listeningFromMe" type="checkbox" defaultChecked={flow.listeningFromMe} />
                    Ouvir minhas mensagens
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input name="splitMessages" type="checkbox" defaultChecked={flow.splitMessages} />
                    Dividir mensagens
                  </label>
                </div>
                <input
                  name="keywordFinish"
                  defaultValue={flow.keywordFinish}
                  placeholder="Palavra para encerrar"
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <input
                  name="unknownMessage"
                  defaultValue={flow.unknownMessage}
                  placeholder="Mensagem padrao"
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <input
                  name="expire"
                  type="number"
                  defaultValue={flow.expire}
                  placeholder="Expiracao"
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <input
                  name="debounceTime"
                  type="number"
                  defaultValue={flow.debounceTime}
                  placeholder="Debounce"
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <input
                  name="delayMessage"
                  type="number"
                  defaultValue={flow.delayMessage}
                  placeholder="Delay"
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <input
                  name="timePerChar"
                  type="number"
                  defaultValue={flow.timePerChar}
                  placeholder="Tempo por caractere"
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                />
                <button className="md:col-span-2 rounded-full border border-cyan-400/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-100">
                  Salvar fluxo
                </button>
              </form>
              <div className="flex flex-wrap items-center gap-3">
                {editorUrl && (
                  <a
                    className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900"
                    href={`/dashboard/flows/${flow.id}/editor`}
                  >
                    Abrir construtor
                  </a>
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
            </div>
          );
        })}
      </section>
    </div>
  );
}
