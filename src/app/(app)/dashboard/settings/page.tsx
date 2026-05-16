import { requireUser } from '@/server/auth/context';
import { getAgencyUsage } from '@/server/data/agency';

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function SettingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await requireUser();
  const usage = user.agencyId ? await getAgencyUsage(user.agencyId) : null;
  const agency = usage?.agency;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Configurações</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Conta e white-label</h1>
      </header>

      {params?.error && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          {params.error}
        </div>
      )}

      {agency && (
        <>
          <section className="panel rounded-3xl p-6">
            <h2 className="text-sm font-semibold text-white">Plano</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              {[
                { label: 'Plano', value: agency.plan },
                { label: 'Clientes', value: `${usage.clients}/${agency.maxClients}` },
                { label: 'Instancias', value: `${usage.instances}/${agency.maxInstances}` },
                { label: 'Bots ativos', value: usage.activeLinks },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="panel rounded-3xl p-6">
            <h2 className="text-sm font-semibold text-white">Dados da agência</h2>
            <form action="/api/agency" method="post" className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                name="name"
                required
                defaultValue={agency.name}
                placeholder="Nome da agência"
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <input
                name="billingEmail"
                type="email"
                defaultValue={agency.billingEmail ?? ''}
                placeholder="Email financeiro"
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <input
                name="brandName"
                defaultValue={agency.brandName ?? ''}
                placeholder="Nome exibido para a marca"
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <input
                name="primaryColor"
                defaultValue={agency.primaryColor ?? ''}
                placeholder="Cor primaria (ex: #22c55e)"
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <input
                name="brandLogoUrl"
                defaultValue={agency.brandLogoUrl ?? ''}
                placeholder="URL do logo"
                className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <button className="md:col-span-2 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900">
                Salvar configuracoes
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
