import { requireUser } from '@/server/auth/context';
import { labelStatus, statusColor } from '@/lib/labels';
import { getBotSessions } from '@/server/data/sessions';

export default async function SessionsPage() {
  const user = await requireUser();
  const sessions = user.agencyId ? await getBotSessions(user.agencyId) : [];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sessões</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Conversas do bot</h1>
      </header>

      <section className="grid gap-4">
        {sessions.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm text-slate-400">
            Nenhuma sessão registrada ainda.
          </div>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 md:grid-cols-[1fr_auto]"
          >
            <div>
              <p className="text-sm font-semibold text-white">{session.pushName || session.remoteJid || 'Contato'}</p>
              <p className="mt-1 text-xs text-slate-400">
                {session.client.name}
                {session.link?.flow ? ` · ${session.link.flow.name}` : ''}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Mensagens: {session.messageCount} · Última atividade:{' '}
                {session.lastMessageAt ? session.lastMessageAt.toLocaleString('pt-BR') : '-'}
              </p>
            </div>
            <span className={`h-fit rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${statusColor(session.status)}`}>
              {labelStatus(session.status)}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
