export default function PendingPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-white">Conta pendente</h1>
      <p className="text-sm text-slate-400">
        Sua conta foi criada, mas ainda precisa de aprovacao manual.
      </p>
      <form action="/api/auth/logout" method="post">
        <button className="rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
          Sair
        </button>
      </form>
    </div>
  );
}
