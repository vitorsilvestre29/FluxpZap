import { redirect } from 'next/navigation';

import { requireUser } from '@/server/auth/context';
import { getPendingUsers } from '@/server/auth/user.service';

export default async function ApprovalsPage() {
  const user = await requireUser();
  if (user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const pending = await getPendingUsers();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Aprovacoes</h1>
      </header>

      <div className="grid gap-4">
        {pending.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm text-slate-400">
            Nenhuma conta pendente.
          </div>
        )}
        {pending.map((user) => (
          <div
            key={user.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4"
          >
            <div>
              <p className="text-sm font-semibold text-white">{user.name ?? user.email}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
              <p className="text-xs text-slate-500">Agencia: {user.agency?.name ?? '-'}</p>
            </div>
            <form action="/api/admin/approvals" method="post">
              <input type="hidden" name="userId" value={user.id} />
              <button className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900">
                Aprovar
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
