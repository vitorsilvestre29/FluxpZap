type PageProps = {
  searchParams?: { error?: string };
};

export default function SignupPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Fluxozap</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Criar conta</h1>
        <p className="mt-2 text-sm text-slate-400">Cadastre sua agencia para entrar na lista.</p>
      </div>

      {searchParams?.error && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
          {searchParams.error}
        </div>
      )}

      <form action="/api/auth/signup" method="post" className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Nome</label>
          <input
            name="name"
            required
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Agencia</label>
          <input
            name="agencyName"
            required
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Senha</label>
          <input
            name="password"
            type="password"
            minLength={8}
            required
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
        </div>
        <button className="w-full rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900">
          Solicitar acesso
        </button>
      </form>

      <div className="text-sm text-slate-400">
        Ja tem conta? <a className="text-cyan-200" href="/auth/login">Entrar</a>
      </div>
    </div>
  );
}
