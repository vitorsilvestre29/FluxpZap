import Link from "next/link";

const pillars = [
  {
    title: "Operação blindada",
    detail: "A agência controla acessos, aprovações, planos e entregas sem expor bastidor técnico ao cliente final.",
  },
  {
    title: "WhatsApp em escala",
    detail: "Uma instância dedicada por cliente, status ao vivo, reconexão rápida e governança para crescer sem gambiarra.",
  },
  {
    title: "Fluxos prontos para venda",
    detail: "Crie, publique e pause bots com construtor visual embutido, mantendo o produto com a sua marca.",
  },
];

const stats = [
  { label: "Cliente + número + fluxo", value: "1 cockpit" },
  { label: "Entrega white-label", value: "100%" },
  { label: "Leitura operacional", value: "Tempo real" },
];

const lanes = [
  "Cadastro e aprovação de agências",
  "Carteira por cliente com contatos e notas",
  "Conexão QR, restart e diagnóstico de instâncias",
  "Criação de fluxos visuais com motor dedicado",
  "Publicação e pausa de bots por vínculo",
  "Leitura básica de sessões em andamento",
];

export default function PublicHomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[var(--foreground)]">
      <div className="absolute inset-0 ambient-grid opacity-25" aria-hidden />
      <div className="noise-overlay absolute inset-0" aria-hidden />

      <header className="relative z-10">
        <nav className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-[rgba(193,255,114,0.34)] bg-[rgba(193,255,114,0.12)] font-mono text-sm tracking-[0.28em] text-[var(--accent)]">
              FZ
            </span>
            <div>
              <p className="eyebrow">Fluxozap</p>
              <p className="display-title mt-1 text-2xl text-[var(--foreground)]">White-label command</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-secondary">
              Entrar
            </Link>
            <Link href="/auth/signup" className="btn-primary">
              Solicitar acesso
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-[1240px] gap-8 px-6 pb-16 pt-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-24 lg:pt-10">
        <div className="animate-fade-up">
          <div className="badge status-neutral">SaaS para agências que vendem automação no WhatsApp</div>
          <h1 className="display-title mt-7 max-w-4xl text-[3.6rem] leading-[0.92] tracking-[-0.06em] text-[var(--foreground)] sm:text-[5.25rem]">
            Um cockpit white-label para vender bots sem parecer improviso.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--foreground-soft)]">
            Fluxozap transforma operação espalhada em produto. A agência gerencia clientes, números, fluxos e entregas
            num painel com leitura clara, narrativa premium e controle centralizado.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/auth/signup" className="btn-primary">
              Comecar com minha agencia
            </Link>
            <Link href="/auth/login" className="btn-secondary">
              Acessar cockpit
            </Link>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="metric-card rounded-[1.8rem] p-5">
                <p className="eyebrow">{item.label}</p>
                <p className="display-title mt-4 text-3xl text-[var(--foreground)]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-drift relative">
          <div className="panel rounded-[2rem] p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Sala de comando</p>
                <h2 className="display-title mt-3 text-3xl text-[var(--foreground)]">Operacao ao vivo</h2>
              </div>
              <span className="badge status-good">Stack estavel</span>
            </div>

            <div className="mt-8 grid gap-4">
              <div className="metric-card rounded-[1.7rem] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">Mapa operacional</p>
                    <p className="mt-3 text-base font-semibold text-[var(--foreground)]">Cliente, instancia e fluxo no mesmo quadro</p>
                  </div>
                  <span className="display-title text-4xl text-[var(--accent)]">03</span>
                </div>
              </div>

              {[
                ["Clientes", "Carteira organizada com notas, status e historico."],
                ["Instancias", "QR code, reconexao e leitura de conectividade."],
                ["Fluxos", "Criacao visual pronta para publicar ou pausar."],
                ["Sessoes", "Visibilidade do bot sem abrir varias ferramentas."],
              ].map(([title, detail]) => (
                <div key={title} className="soft-panel rounded-[1.5rem] p-4">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-[var(--border)] bg-[rgba(245,236,220,0.03)]">
        <div className="mx-auto grid w-full max-w-[1240px] gap-5 px-6 py-14 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="panel rounded-[1.9rem] p-6">
              <p className="eyebrow">Pilar</p>
              <h3 className="display-title mt-4 text-3xl text-[var(--foreground)]">{pillar.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">{pillar.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-[1240px] px-6 py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Entrega memoravel</p>
            <h2 className="display-title mt-4 text-5xl leading-none text-[var(--foreground)]">
              Menos painel genérico.
              <br />
              Mais produto que vende.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {lanes.map((lane) => (
              <div key={lane} className="soft-panel rounded-[1.5rem] p-5 text-sm leading-7 text-[var(--foreground-soft)]">
                {lane}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
