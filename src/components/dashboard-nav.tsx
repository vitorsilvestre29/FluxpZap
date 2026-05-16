"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardNavProps = {
  isSuperAdmin: boolean;
};

const baseItems = [
  { href: "/dashboard", label: "Visão geral" },
  { href: "/dashboard/clients", label: "Clientes" },
  { href: "/dashboard/flows", label: "Fluxos" },
  { href: "/dashboard/instances", label: "Instâncias" },
  { href: "/dashboard/links", label: "Vínculos" },
  { href: "/dashboard/sessions", label: "Sessões" },
  { href: "/dashboard/settings/integrations", label: "Integrações" },
  { href: "/dashboard/settings", label: "Conta" },
];

const adminItems = [
  { href: "/dashboard/admin/approvals", label: "Aprovações" },
  { href: "/dashboard/admin/agencies", label: "Agências" },
];

export function DashboardNav({ isSuperAdmin }: DashboardNavProps) {
  const pathname = usePathname();
  const items = isSuperAdmin ? [...baseItems, ...adminItems] : baseItems;

  return (
    <nav className="flex flex-col gap-2 text-sm">
      {items.map((item) => {
        const active =
          pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "rounded-[1.2rem] border px-4 py-3",
              active
                ? "border-[rgba(193,255,114,0.35)] bg-[rgba(193,255,114,0.11)] text-[var(--foreground)]"
                : "border-transparent bg-transparent text-[var(--foreground-soft)] hover:border-[rgba(245,236,220,0.12)] hover:bg-[rgba(245,236,220,0.04)] hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
