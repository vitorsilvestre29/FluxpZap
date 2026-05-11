import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { getSessionUser } from '@/server/auth/session';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/login');
  }

  if (user.status === 'PENDING') {
    redirect('/auth/pending');
  }

  if (user.status === 'SUSPENDED') {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-6 py-8">
        <aside className="hidden w-64 flex-shrink-0 flex-col gap-6 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6 lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Fluxozap</p>
            <p className="mt-2 text-lg font-semibold text-white">Painel</p>
          </div>
          <nav className="flex flex-col gap-3 text-sm text-slate-300">
            <a className="rounded-full border border-transparent px-3 py-2 hover:border-slate-700" href="/dashboard">
              Visao geral
            </a>
            <a className="rounded-full border border-transparent px-3 py-2 hover:border-slate-700" href="/dashboard/clients">
              Clientes
            </a>
            <a className="rounded-full border border-transparent px-3 py-2 hover:border-slate-700" href="/dashboard/flows">
              Fluxos
            </a>
            <a className="rounded-full border border-transparent px-3 py-2 hover:border-slate-700" href="/dashboard/instances">
              Instancias
            </a>
            <a className="rounded-full border border-transparent px-3 py-2 hover:border-slate-700" href="/dashboard/links">
              Vinculos
            </a>
            <a className="rounded-full border border-transparent px-3 py-2 hover:border-slate-700" href="/dashboard/sessions">
              Sessoes
            </a>
            <a
              className="rounded-full border border-transparent px-3 py-2 hover:border-slate-700"
              href="/dashboard/settings/integrations"
            >
              Integracoes
            </a>
            <a className="rounded-full border border-transparent px-3 py-2 hover:border-slate-700" href="/dashboard/settings">
              Conta
            </a>
            {user.role === 'SUPER_ADMIN' && (
              <>
                <a
                  className="rounded-full border border-transparent px-3 py-2 hover:border-slate-700"
                  href="/dashboard/admin/approvals"
                >
                  Aprovacoes
                </a>
                <a
                  className="rounded-full border border-transparent px-3 py-2 hover:border-slate-700"
                  href="/dashboard/admin/agencies"
                >
                  Agencias
                </a>
              </>
            )}
          </nav>
          <form action="/api/auth/logout" method="post">
            <button className="w-full rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
              Sair
            </button>
          </form>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
