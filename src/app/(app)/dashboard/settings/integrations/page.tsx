import { requireUser } from '@/server/auth/context';
import { getIntegration } from '@/server/integrations/integration.service';
import { getDefaultTypebotApiUrl, getDefaultTypebotEditorTemplate } from '@/server/integrations/typebot';

export default async function IntegrationsPage() {
  const user = await requireUser();
  if (!user.agencyId) return null;

  const evolution = await getIntegration(user.agencyId, 'EVOLUTION');
  const typebot = await getIntegration(user.agencyId, 'TYPEBOT');
  const typebotTemplate =
    (typebot?.metadata as { editorTemplate?: string } | null)?.editorTemplate ||
    process.env.TYPEBOT_EDITOR_TEMPLATE ||
    getDefaultTypebotEditorTemplate(typebot?.baseUrl ?? process.env.TYPEBOT_BASE_URL);
  const typebotMetadata = typebot?.metadata as
    | { apiUrl?: string; workspaceId?: string; viewerUrl?: string }
    | null;

  const evolutionKeySet = Boolean(evolution?.apiKey || process.env.EVOLUTION_API_KEY);
  const typebotKeySet = Boolean(typebot?.apiKey || process.env.TYPEBOT_API_KEY);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Integrações</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Configuração</h1>
      </header>

      <section className="panel rounded-3xl p-6">
        <h2 className="text-sm font-semibold text-white">Evolution API</h2>
        <form action="/api/integrations" method="post" className="mt-4 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="type" value="EVOLUTION" />
          <input
            name="baseUrl"
            defaultValue={evolution?.baseUrl ?? process.env.EVOLUTION_BASE_URL ?? ''}
            placeholder="Base URL (ex: https://evolution.seudominio.com)"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <div className="relative">
            <input
              name="apiKey"
              type="password"
              placeholder={evolutionKeySet ? '••••••••  (deixe em branco para manter)' : 'API Key'}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            />
            {evolutionKeySet && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-emerald-400">
                ✓ configurada
              </span>
            )}
          </div>
          <button className="md:col-span-2 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900">
            Salvar Evolution
          </button>
        </form>
      </section>

      <section className="panel rounded-3xl p-6">
        <h2 className="text-sm font-semibold text-white">Construtor de fluxos</h2>
        <p className="mt-2 text-xs text-slate-400">
          Motor visual usado por trás do Fluxozap. Para mascarar a marca, use uma instalação própria e deixe o template interno.
        </p>
        <form action="/api/integrations" method="post" className="mt-4 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="type" value="TYPEBOT" />
          <input
            name="baseUrl"
            defaultValue={typebot?.baseUrl ?? process.env.TYPEBOT_BASE_URL ?? ''}
            placeholder="URL do motor de fluxos"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <div className="relative">
            <input
              name="apiKey"
              type="password"
              placeholder={typebotKeySet ? '••••••••  (deixe em branco para manter)' : 'Chave interna do construtor'}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            />
            {typebotKeySet && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-emerald-400">
                ✓ configurada
              </span>
            )}
          </div>
          <input
            name="workspaceId"
            defaultValue={typebotMetadata?.workspaceId ?? process.env.TYPEBOT_WORKSPACE_ID ?? ''}
            placeholder="Workspace ID"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            name="apiUrl"
            defaultValue={
              typebotMetadata?.apiUrl ??
              process.env.TYPEBOT_API_URL ??
              getDefaultTypebotApiUrl(typebot?.baseUrl ?? process.env.TYPEBOT_BASE_URL) ??
              ''
            }
            placeholder="URL da API interna"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            name="viewerUrl"
            defaultValue={typebotMetadata?.viewerUrl ?? process.env.TYPEBOT_VIEWER_URL ?? ''}
            placeholder="URL pública dos bots"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            name="editorTemplate"
            defaultValue={typebotTemplate}
            placeholder="Template interno (ex: /_fluxo-builder/typebots/{{typebotId}})"
            className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <button className="md:col-span-2 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900">
            Salvar construtor
          </button>
        </form>
      </section>
    </div>
  );
}
