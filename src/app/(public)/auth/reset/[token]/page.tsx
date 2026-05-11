type PageProps = {
  params: { token: string };
};

export default function ResetPasswordPage({ params }: PageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Nova senha</h1>
        <p className="mt-2 text-sm text-slate-400">Defina uma nova senha para sua conta.</p>
      </div>

      <form action="/api/auth/reset/confirm" method="post" className="space-y-4">
        <input type="hidden" name="token" value={params.token} />
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
          Atualizar senha
        </button>
      </form>
    </div>
  );
}
