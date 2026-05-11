import Link from 'next/link';

const features = [
  'Agencias aprovadas manualmente',
  '1 WhatsApp dedicado por cliente',
  'Editor Typebot embutido',
  'QR, reconexao e status Evolution',
  'Publicacao e pausa por bot',
  'Sessoes basicas por cliente',
];

const plans = [
  { name: 'Starter', price: 'R$ 297', detail: '10 clientes e operacao essencial' },
  { name: 'Growth', price: 'R$ 697', detail: '50 clientes e suporte prioritario' },
  { name: 'Scale', price: 'Sob consulta', detail: 'Operacao white-label dedicada' },
];

export default function PublicHomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 text-sm font-bold text-slate-950">
              FZ
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Fluxozap</p>
              <p className="text-xs text-slate-400">SaaS para agencias de WhatsApp bot</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link className="text-slate-300 hover:text-white" href="/auth/login">
              Entrar
            </Link>
            <Link className="rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-950" href="/auth/signup">
              Solicitar acesso
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-89px)] w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">White-label para agencias</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Venda chatbots de WhatsApp com painel proprio, governanca e operacao centralizada.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            O Fluxozap organiza clientes, numeros, Typebot e Evolution API em um produto pronto para agencia vender,
            entregar e acompanhar sem dar acesso ao cliente final.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950" href="/auth/signup">
              Comecar agora
            </Link>
            <Link className="rounded-full border border-slate-700 px-6 py-3 text-sm text-slate-200" href="/auth/login">
              Acessar painel
            </Link>
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Operacao da agencia</p>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">Ativa</span>
          </div>
          <div className="mt-6 grid gap-3">
            {[
              ['Clientes ativos', '42'],
              ['WhatsApps conectados', '39'],
              ['Bots publicados', '36'],
              ['Sessoes abertas', '184'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border border-slate-800 bg-slate-950 px-4 py-3">
                <span className="text-sm text-slate-300">{label}</span>
                <strong className="text-lg text-white">{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature} className="border border-slate-800 bg-slate-950 px-5 py-4 text-sm text-slate-200">
              {feature}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Planos</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Modelo simples para vender recorrencia.</h2>
          </div>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="mt-4 text-3xl font-semibold text-cyan-200">{plan.price}</p>
              <p className="mt-3 text-sm text-slate-400">{plan.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
