import { requireUser } from '@/server/auth/context';
import { getClients } from '@/server/data/clients';
import { labelStatus } from '@/lib/labels';
import { ConfirmDelete } from '@/components/confirm-delete';

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function ClientsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await requireUser();
  const agencyId = user.agencyId || '';
  const clients = agencyId ? await getClients(agencyId) : [];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Clientes</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Carteira</h1>
      </header>

      <section className="panel rounded-3xl p-6">
        <h2 className="text-sm font-semibold text-white">Novo cliente</h2>
        {params?.error && (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            {params.error}
          </div>
        )}
        <form action="/api/clients" method="post" className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            name="name"
            required
            placeholder="Nome do cliente"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            name="whatsappNumber"
            required
            placeholder="WhatsApp do cliente (ex: 5511999999999)"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            name="contactName"
            placeholder="Contato"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            name="contactEmail"
            type="email"
            placeholder="Email"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <input
            name="contactPhone"
            placeholder="Telefone do contato"
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <textarea
            name="notes"
            placeholder="Observações internas"
            rows={3}
            className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
          <button className="md:col-span-2 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900">
            Criar cliente
          </button>
        </form>
      </section>

      <section className="grid gap-4">
        {clients.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm text-slate-400">
            Nenhum cliente cadastrado.
          </div>
        )}
        {clients.map((client) => (
          <div
            key={client.id}
            className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{client.name}</p>
                <p className="text-xs text-slate-400">WhatsApp: {client.whatsappNumber ?? '-'}</p>
                <p className="text-xs text-slate-500">
                  Instâncias: {client.instances.length} · Sessões: {client._count.botSessions}
                </p>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                {labelStatus(client.status)}
              </span>
            </div>
            <form action="/api/clients" method="post" className="grid gap-3 md:grid-cols-3">
              <input type="hidden" name="clientId" value={client.id} />
              <input
                name="name"
                defaultValue={client.name}
                required
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <input
                name="whatsappNumber"
                defaultValue={client.whatsappNumber ?? ''}
                required
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <select
                name="status"
                defaultValue={client.status}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="PAUSED">Pausado</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
              <input
                name="contactName"
                defaultValue={client.contactName ?? ''}
                placeholder="Contato"
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <input
                name="contactEmail"
                type="email"
                defaultValue={client.contactEmail ?? ''}
                placeholder="Email"
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <input
                name="contactPhone"
                defaultValue={client.contactPhone ?? ''}
                placeholder="Telefone"
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <textarea
                name="notes"
                defaultValue={client.notes ?? ''}
                rows={2}
                className="md:col-span-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
              <button className="md:col-span-3 rounded-full border border-cyan-400/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-100">
                Salvar
              </button>
            </form>
            <div className="flex justify-end">
              <ConfirmDelete
                action="/api/clients/delete"
                hiddenFields={{ clientId: client.id }}
                message="Remover este cliente? Esta ação não pode ser desfeita."
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
