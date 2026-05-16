import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell flex items-center px-5 py-8 text-[var(--foreground)] sm:px-6 lg:min-h-screen lg:px-8">
      <div className="relative mx-auto grid w-full max-w-[1220px] gap-6 lg:grid-cols-[0.95fr_0.85fr]">
        <section className="panel hidden rounded-[2.2rem] p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-[rgba(193,255,114,0.34)] bg-[rgba(193,255,114,0.12)] font-mono text-sm tracking-[0.28em] text-[var(--accent)]">
                FZ
              </span>
              <div>
                <p className="eyebrow">Fluxozap</p>
                <p className="display-title mt-1 text-3xl">Operação com assinatura</p>
              </div>
            </Link>

            <div className="mt-16 max-w-xl">
              <p className="eyebrow">Acesso controlado</p>
              <h1 className="display-title mt-5 text-6xl leading-[0.92] tracking-[-0.06em] text-[var(--foreground)]">
                Sua agência entra.
                <br />
                O caos fica fora.
              </h1>
              <p className="mt-6 text-lg leading-8 text-[var(--foreground-soft)]">
                O Fluxozap concentra clientes, números, fluxos e atendimento num cockpit white-label para operações
                que querem vender automação com mais valor percebido.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Aprovacao", "Entrada curada por agencia"],
              ["Controle", "Uma operacao por cliente"],
              ["Entrega", "Bots com leitura clara"],
            ].map(([title, detail]) => (
              <div key={title} className="soft-panel rounded-[1.5rem] p-4">
                <p className="eyebrow">{title}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-card panel flex min-h-[640px] items-center rounded-[2.2rem] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </section>
      </div>
    </div>
  );
}
