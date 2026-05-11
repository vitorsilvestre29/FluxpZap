import Link from 'next/link';

type PageProps = {
  searchParams?: { error?: string; verified?: string; reset?: string };
};

export default function LoginPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Fluxozap</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Entrar</h1>
        <p className="mt-2 text-sm text-slate-400">Acesse sua operacao e clientes.</p>
      </div>

      {(searchParams?.error || searchParams?.verified || searchParams?.reset) && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
          {searchParams?.error && <p>{searchParams.error}</p>}
          {searchParams?.verified && <p>Email verificado com sucesso.</p>}
          {searchParams?.reset && <p>Senha atualizada. Faça login.</p>}
        </div>
      )}

      <form action="/api/auth/login" method="post" className="space-y-4">
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
            required
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
        </div>
        <button className="w-full rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900">
          Entrar
        </button>
      </form>

      <div className="flex flex-col gap-2 text-sm text-slate-400">
        <Link className="text-cyan-200" href="/auth/reset">
          Esqueci minha senha
        </Link>
        <Link className="text-cyan-200" href="/auth/signup">
          Criar conta
        </Link>
      </div>
    </div>
  );
}
