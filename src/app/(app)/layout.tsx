import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardNav } from "@/components/dashboard-nav";
import { getSessionUser } from "@/server/auth/session";
import { labelStatus, labelRole } from "@/lib/labels";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.status === "PENDING") {
    redirect("/auth/pending");
  }

  if (user.status === "SUSPENDED") {
    redirect("/auth/login");
  }

  return (
    <div className="workspace-shell text-[var(--foreground)]">
      <div className="absolute inset-0 ambient-grid opacity-30" aria-hidden />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] gap-6 px-4 py-4 lg:px-6">
        <aside className="dashboard-card panel hidden w-[312px] shrink-0 flex-col justify-between p-6 lg:flex">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-[rgba(193,255,114,0.3)] bg-[rgba(193,255,114,0.12)] font-mono text-sm tracking-[0.28em] text-[var(--accent)]">
                FZ
              </div>
              <div>
                <p className="eyebrow">Fluxozap Control</p>
                <h1 className="display-title mt-3 text-4xl text-[var(--foreground)]">Sala de operação</h1>
                <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--foreground-soft)]">
                  White-label para agências venderem automação com menos caos e mais governança.
                </p>
              </div>
            </div>

            <div className="soft-panel rounded-[1.6rem] p-4">
              <p className="eyebrow">Conta ativa</p>
              <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">{user.name ?? user.email}</p>
              <p className="mt-1 text-sm text-[var(--foreground-soft)]">{user.email}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="badge status-good">{labelStatus(user.status)}</span>
                <span className="badge status-neutral">{labelRole(user.role)}</span>
              </div>
            </div>

            <DashboardNav isSuperAdmin={user.role === "SUPER_ADMIN"} />
          </div>

          <div className="space-y-4">
            <div className="soft-panel rounded-[1.6rem] p-4 text-sm text-[var(--foreground-soft)]">
              <p className="eyebrow">Ritmo</p>
              <p className="mt-3 leading-6">
                Clientes, instâncias e fluxos ficam alinhados em um único cockpit.
              </p>
            </div>
            <form action="/api/auth/logout" method="post">
              <button className="btn-secondary w-full">Sair da conta</button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="dashboard-card panel p-4 lg:hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Fluxozap</p>
                <h1 className="display-title mt-2 text-3xl">Cockpit</h1>
              </div>
              <form action="/api/auth/logout" method="post">
                <button className="btn-secondary">Sair</button>
              </form>
            </div>
            <div className="mt-4 overflow-x-auto pb-1">
              <div className="min-w-max">
                <DashboardNav isSuperAdmin={user.role === "SUPER_ADMIN"} />
              </div>
            </div>
          </header>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
