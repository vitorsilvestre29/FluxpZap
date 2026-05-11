import Image from 'next/image';

import { requireUser } from '@/server/auth/context';
import { getClients } from '@/server/data/clients';
import { getInstances } from '@/server/data/instances';

type PageProps = {
  searchParams?: { error?: string };
};

export default async function InstancesPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const agencyId = user.agencyId || '';
  const instances = agencyId ? await getInstances(agencyId) : [];
  const clients = agencyId ? await getClients(agencyId) : [];
  const availableClients = clients.filter((client) => client.status === 'ACTIVE' && client.instances.length === 0);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Instancias</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">WhatsApp</h1>
      </header>

      <section className="panel rounded-3xl p-6">
        <h2 className="text-sm font-semibold text-white">Nova instancia</h2>
        {searchParams?.error && (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            {searchParams.error}
          </div>
        )}
        <form action="/api/instances" method="post" className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            name="instanceName"
            required
            placeholder="Nome da instancia"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <select
            name="clientId"
            required
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          >
            <option value="">Selecione o cliente</option>
            {availableClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} · {client.whatsappNumber}
              </option>
            ))}
          </select>
          <button className="md:col-span-2 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900">
            Criar instancia
          </button>
        </form>
      </section>

      <section className="grid gap-4">
        {instances.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm text-slate-400">
            Nenhuma instancia criada.
          </div>
        )}
        {instances.map((instance) => (
          <div
            key={instance.id}
            className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 md:grid-cols-[1.1fr_0.9fr]"
          >
            <div>
              <p className="text-sm font-semibold text-white">{instance.instanceName}</p>
              <p className="text-xs text-slate-400">Cliente: {instance.client.name}</p>
              <p className="text-xs text-slate-500">WhatsApp: {instance.client.whatsappNumber ?? '-'}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{instance.status}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action="/api/instances/status" method="post">
                  <input type="hidden" name="instanceId" value={instance.id} />
                  <button className="rounded-full border border-slate-700 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                    Atualizar
                  </button>
                </form>
                <form action="/api/instances/reconnect" method="post">
                  <input type="hidden" name="instanceId" value={instance.id} />
                  <input type="hidden" name="mode" value="connect" />
                  <button className="rounded-full border border-cyan-400/50 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cyan-100">
                    QR/Conectar
                  </button>
                </form>
                <form action="/api/instances/reconnect" method="post">
                  <input type="hidden" name="instanceId" value={instance.id} />
                  <input type="hidden" name="mode" value="restart" />
                  <button className="rounded-full border border-amber-400/40 px-3 py-2 text-xs uppercase tracking-[0.2em] text-amber-100">
                    Reconectar
                  </button>
                </form>
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-4 text-center text-xs text-slate-400">
              {instance.lastQrCode ? (
                <Image src={instance.lastQrCode} alt="QR Code" width={112} height={112} className="mx-auto" />
              ) : (
                'QR nao gerado'
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
