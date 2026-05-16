import { redirect } from 'next/navigation';

import { requireUser } from '@/server/auth/context';
import { getAgencies } from '@/server/data/admin';
import { labelStatus, labelRole } from '@/lib/labels';

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AgenciesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await requireUser();
  if (user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const agencies = await getAgencies();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Agências</h1>
      </header>

      <section className="panel rounded-3xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Nova agência</h2>
            <p className="mt-1 text-sm text-slate-400">
              Cadastre manualmente um cliente pagante e entregue o acesso inicial ao responsável.
            </p>
          </div>
        </div>
        {params?.error && (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            {params.error}
          </div>
        )}
        <form action="/api/admin/agencies" method="post" className="mt-5 grid gap-4 md:grid-cols-3">
          <input type="hidden" name="action" value="create" />
          <input
            name="agencyName"
            required
            placeholder="Nome da agência"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            name="ownerName"
            placeholder="Nome do responsável"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            name="ownerEmail"
            required
            type="email"
            placeholder="Email de login"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            name="ownerPassword"
            required
            minLength={8}
            type="password"
            placeholder="Senha inicial"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <select
            name="plan"
            defaultValue="STARTER"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          >
            <option value="STARTER">Starter</option>
            <option value="GROWTH">Growth</option>
            <option value="SCALE">Scale</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="maxClients"
              type="number"
              min={1}
              defaultValue={10}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            />
            <input
              name="maxInstances"
              type="number"
              min={1}
              defaultValue={10}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
            />
          </div>
          <button className="md:col-span-3 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900">
            Criar agência
          </button>
        </form>
      </section>

      <section className="grid gap-4">
        {agencies.map((agency) => (
          <div
            key={agency.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4"
          >
            <div>
              <p className="text-sm font-semibold text-white">{agency.name}</p>
              <p className="text-xs text-slate-400">Slug: {agency.slug}</p>
              <p className="text-xs text-slate-500">
                Status: {labelStatus(agency.status)} · Plano: {agency.plan} · Instâncias: {agency.instances.length}/{agency.maxInstances} · Clientes: {agency.clients.length}/{agency.maxClients}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              Usuários: {agency.users.length} | Clientes: {agency.clients.length}
              <form action="/api/admin/agencies" method="post">
                <input type="hidden" name="agencyId" value={agency.id} />
                <input type="hidden" name="status" value={agency.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'} />
                <button className="rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                  {agency.status === 'ACTIVE' ? 'Suspender' : 'Ativar'}
                </button>
              </form>
            </div>
            <form action="/api/admin/agencies" method="post" className="basis-full grid gap-3 border-t border-slate-800 pt-3 md:grid-cols-4">
              <input type="hidden" name="agencyId" value={agency.id} />
              <input type="hidden" name="action" value="commercials" />
              <select
                name="plan"
                defaultValue={agency.plan}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              >
                <option value="STARTER">Starter</option>
                <option value="GROWTH">Growth</option>
                <option value="SCALE">Scale</option>
              </select>
              <input
                name="maxClients"
                type="number"
                min={1}
                defaultValue={agency.maxClients}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <input
                name="maxInstances"
                type="number"
                min={1}
                defaultValue={agency.maxInstances}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <button className="rounded-full border border-cyan-400/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-100">
                Salvar plano
              </button>
            </form>
            <div className="basis-full border-t border-slate-800 pt-3">
              <div className="grid gap-2">
                {agency.users.map((agencyUser) => (
                  <div key={agencyUser.id} className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                    <span>
                      {agencyUser.name ?? agencyUser.email} · {labelRole(agencyUser.role)} · {labelStatus(agencyUser.status)}
                    </span>
                    <form action="/api/admin/agencies" method="post">
                      <input type="hidden" name="userId" value={agencyUser.id} />
                      <input type="hidden" name="status" value={agencyUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'} />
                      <button className="rounded-full border border-slate-700 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-200">
                        {agencyUser.status === 'ACTIVE' ? 'Suspender' : 'Ativar'}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
