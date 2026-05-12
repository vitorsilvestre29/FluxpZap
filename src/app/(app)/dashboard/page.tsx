import { requireUser } from '@/server/auth/context';
import { getDashboardStats, getLinks } from '@/server/data';

export default async function AppHomePage() {
  const user = await requireUser();
  const agencyId = user.agencyId || '';
  const stats = agencyId
    ? await getDashboardStats(agencyId)
    : { clients: 0, instances: 0, connectedInstances: 0, flows: 0, publishedFlows: 0, activeLinks: 0, openSessions: 0 };
  const links = agencyId ? await getLinks(agencyId) : [];

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
                Nova instancia
              </a>
            </div>
          </header>

          <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="panel rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Operacao agora</h2>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">
                  Estavel
                </span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Clientes', value: stats.clients },
                  { label: 'WhatsApps online', value: `${stats.connectedInstances}/${stats.instances}` },
                  { label: 'Fluxos publicados', value: `${stats.publishedFlows}/${stats.flows}` },
                  { label: 'Sessoes abertas', value: stats.openSessions },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/5 px-4 py-4 text-sm text-cyan-200">
                Bots ativos: {stats.activeLinks} · Ultimo vinculo: {links[0]?.client?.name ?? 'Nenhum ainda.'}
              </div>
            </div>

            <div className="panel rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-white">Vinculos recentes</h2>
              <div className="mt-6 grid gap-4">
                {links.length === 0 && (
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-4 text-sm text-slate-400">
                    Nenhum vinculo criado.
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
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-300">{link.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              { title: 'Clientes', detail: 'Cadastre e gerencie as contas.' , href: '/dashboard/clients'},
              { title: 'Fluxos', detail: 'Crie e publique conversas visuais.', href: '/dashboard/flows' },
              { title: 'Instancias', detail: 'Conecte WhatsApp.', href: '/dashboard/instances' },
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
