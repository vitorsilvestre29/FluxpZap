import Image from 'next/image';

import { requireUser } from '@/server/auth/context';
import { getClients } from '@/server/data/clients';
import { getInstances } from '@/server/data/instances';
import { labelStatus, statusColor } from '@/lib/labels';

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function InstancesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await requireUser();
  const agencyId = user.agencyId || '';
  const instances = agencyId ? await getInstances(agencyId) : [];
  const clients = agencyId ? await getClients(agencyId) : [];
  const availableClients = clients.filter((client) => client.status === 'ACTIVE' && client.instances.length === 0);

  const offlineCount = instances.filter(
    (i) => i.status === 'DISCONNECTED' || i.status === 'ERROR',
  ).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Instâncias</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">WhatsApp</h1>
        </div>
        {offlineCount > 0 && (
          <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-300 border border-red-500/30">
            ⚠ {offlineCount} instância{offlineCount > 1 ? 's' : ''} offline
          </span>
        )}
      </header>

      <section className="panel rounded-3xl p-6">
        <h2 className="text-sm font-semibold text-white">Nova instância</h2>
        {params?.error && (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            {params.error}
          </div>
        )}
        <form action="/api/instances" method="post" className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            name="instanceName"
            required
            placeholder="Nome da instância (ex: DrWilliam)"
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
            Criar instância
          </button>
        </form>
      </section>

      <section className="grid gap-4">
        {instances.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm text-slate-400">
            Nenhuma instância criada.
          </div>
        )}
        {instances.map((instance) => (
          <div
            key={instance.id}
            className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 md:grid-cols-[1.1fr_0.9fr]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-white">{instance.instanceName}</p>
                <span className={`rounded-full border px-2 py-0.5 text-xs uppercase tracking-[0.15em] ${statusColor(instance.status)}`}>
                  {labelStatus(instance.status)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Cliente: {instance.client.name}</p>
              <p className="text-xs text-slate-500">WhatsApp: {instance.client.whatsappNumber ?? '-'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action="/api/instances/status" method="post">
                  <input type="hidden" name="instanceId" value={instance.id} />
                  <button className="rounded-full border border-slate-700 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                    Atualizar status
                  </button>
                </form>
                <form action="/api/instances/reconnect" method="post">
                  <input type="hidden" name="instanceId" value={instance.id} />
                  <input type="hidden" name="mode" value="connect" />
                  <button className="rounded-full border border-cyan-400/50 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cyan-100">
                    QR / Conectar
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
                'QR não gerado'
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
