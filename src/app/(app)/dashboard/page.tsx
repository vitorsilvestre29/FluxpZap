import { requireUser } from '@/server/auth/context';
import { labelStatus, statusColor } from '@/lib/labels';
import { getDashboardStats, getLinks } from '@/server/data';
import { getInstances } from '@/server/data/instances';

export default async function AppHomePage() {
  const user = await requireUser();
  const agencyId = user.agencyId || '';
  const stats = agencyId
    ? await getDashboardStats(agencyId)
    : { clients: 0, instances: 0, connectedInstances: 0, flows: 0, publishedFlows: 0, activeLinks: 0, openSessions: 0 };
  const links = agencyId ? await getLinks(agencyId) : [];
  const instances = agencyId ? await getInstances(agencyId) : [];

  const offlineInstances = instances.filter(
    (i) => i.status === 'DISCONNECTED' || i.status === 'ERROR',
  );
  const systemHealthy = offlineInstances.length === 0;

  return (
    <div className="min-h-screen text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
        <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Centro de comando</h1>
            </div>
            <div className="flex items-center gap-3">
              <a
                className="rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200"
                href="/dashboard/instances"
              >
                Nova instância
              </a>
            </div>
          </header>

          {/* Alertas críticos */}
          {offlineInstances.length > 0 && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm font-semibold text-red-300">
                ⚠ {offlineInstances.length} instância{offlineInstances.length > 1 ? 's' : ''} offline
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {offlineInstances.map((inst) => (
                  <span key={inst.id} className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-300">
                    {inst.instanceName} · {inst.client.name}
                  </span>
                ))}
              </div>
              <a href="/dashboard/instances" className="mt-2 inline-block text-xs text-red-300 underline underline-offset-2">
                Reconectar agora
              </a>
            </div>
          )}

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="panel rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Operação agora</h2>
                <span className={`rounded-full px-3 py-1 text-xs border ${systemHealthy ? 'bg-emerald-400/15 text-emerald-200 border-emerald-400/30' : 'bg-red-400/15 text-red-200 border-red-400/30'}`}>
                  {systemHealthy ? 'Estável' : 'Atenção'}
                </span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Clientes', value: stats.clients },
                  {
                    label: 'WhatsApps online',
                    value: `${stats.connectedInstances}/${stats.instances}`,
                    alert: stats.connectedInstances < stats.instances,
                  },
                  { label: 'Fluxos publicados', value: `${stats.publishedFlows}/${stats.flows}` },
                  { label: 'Sessões abertas', value: stats.openSessions },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl border bg-slate-950/40 p-4 ${'alert' in item && item.alert ? 'border-amber-500/40' : 'border-slate-800/80'}`}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                    <p className={`mt-2 text-2xl font-semibold ${'alert' in item && item.alert ? 'text-amber-300' : 'text-white'}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/5 px-4 py-4 text-sm text-cyan-200">
                Bots ativos: {stats.activeLinks} · Vínculo mais recente: {links[0]?.client?.name ?? 'Nenhum ainda.'}
              </div>
            </div>

            <div className="panel rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-white">Vínculos recentes</h2>
              <div className="mt-6 grid gap-4">
                {links.length === 0 && (
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-4 text-sm text-slate-400">
                    Nenhum vínculo criado.
                  </div>
                )}
                {links.slice(0, 4).map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-4"
                  >
                    <div>
                      <p className="text-sm text-white">{link.client.name}</p>
                      <p className="text-xs text-slate-400">{link.flow.name}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-xs uppercase tracking-[0.15em] ${statusColor(link.status)}`}>
                      {labelStatus(link.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              { title: 'Clientes', detail: 'Cadastre e gerencie as contas.', href: '/dashboard/clients' },
              { title: 'Fluxos', detail: 'Crie e publique conversas visuais.', href: '/dashboard/flows' },
              { title: 'Instâncias', detail: 'Conecte WhatsApp.', href: '/dashboard/instances' },
            ].map((card) => (
              <a key={card.title} href={card.href} className="panel rounded-3xl p-6">
                <p className="text-sm font-semibold text-white">{card.title}</p>
                <p className="mt-3 text-xs text-slate-400">{card.detail}</p>
                <span className="mt-6 inline-flex text-xs uppercase tracking-[0.2em] text-cyan-200">
                  Abrir
                </span>
              </a>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
