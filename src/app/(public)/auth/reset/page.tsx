type PageProps = {
  searchParams?: { token?: string };
};

export default function ResetRequestPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Recuperar senha</h1>
        <p className="mt-2 text-sm text-slate-400">Enviaremos um link para redefinir sua senha.</p>
      </div>

      <form action="/api/auth/reset/request" method="post" className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
          />
        </div>
        <button className="w-full rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900">
          Enviar link
        </button>
      </form>

      {searchParams?.token && (
        <a
          className="inline-flex items-center rounded-full border border-cyan-400/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200"
          href={`/auth/reset/${searchParams.token}`}
        >
          Redefinir senha (DEV)
        </a>
      )}

      <a className="text-sm text-cyan-200" href="/auth/login">
        Voltar para login
      </a>
    </div>
  );
}
