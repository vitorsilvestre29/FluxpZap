import { requireUser } from '@/server/auth/context';
import { getClients } from '@/server/data/clients';
import { getFlows } from '@/server/data/flows';
import { getInstances } from '@/server/data/instances';
import { getLinks } from '@/server/data/links';

type PageProps = {
  searchParams?: { error?: string };
};

export default async function LinksPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const agencyId = user.agencyId || '';
  const clients = agencyId ? await getClients(agencyId) : [];
  const flows = agencyId ? await getFlows(agencyId) : [];
  const instances = agencyId ? await getInstances(agencyId) : [];
  const links = agencyId ? await getLinks(agencyId) : [];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Vinculos</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Cliente + Fluxo + Instancia</h1>
      </header>

      <section className="panel rounded-3xl p-6">
        {searchParams?.error && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            {searchParams.error}
          </div>
        )}
        <form action="/api/links" method="post" className="grid gap-4 md:grid-cols-3">
          <select
            name="clientId"
            required
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          >
            <option value="">Cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <select
            name="flowId"
            required
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          >
            <option value="">Fluxo</option>
            {flows.map((flow) => (
              <option key={flow.id} value={flow.id}>
                {flow.name}
              </option>
            ))}
          </select>
          <select
            name="instanceId"
            required
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          >
            <option value="">Instancia</option>
            {instances.map((instance) => (
              <option key={instance.id} value={instance.id}>
                {instance.client.name} · {instance.instanceName}
              </option>
            ))}
          </select>
          <button className="md:col-span-3 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900">
            Vincular
          </button>
        </form>
      </section>

      <section className="grid gap-4">
        {links.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm text-slate-400">
            Nenhum vinculo criado.
          </div>
        )}
        {links.map((link) => (
          <div
            key={link.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4"
          >
            <div>
              <p className="text-sm font-semibold text-white">{link.client.name}</p>
              <p className="text-xs text-slate-400">{link.flow.name}</p>
              <p className="text-xs text-slate-500">Sessoes: {link._count.sessions}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {link.status} · {link.flow.provider} · {link.instance.instanceName}
              </p>
              <form action="/api/links/deploy" method="post">
                <input type="hidden" name="linkId" value={link.id} />
                <button className="rounded-full border border-cyan-400/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-100">
                  Publicar no WhatsApp
                </button>
              </form>
              <form action="/api/links/status" method="post">
                <input type="hidden" name="linkId" value={link.id} />
                <input type="hidden" name="status" value={link.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'} />
                <button className="rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                  {link.status === 'ACTIVE' ? 'Pausar' : 'Ativar'}
                </button>
              </form>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
