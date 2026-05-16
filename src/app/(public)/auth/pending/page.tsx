export default function PendingPage() {
  return (
    <div className="space-y-6">
      <p className="eyebrow">Conta pendente</p>
      <h1 className="display-title text-5xl leading-none text-[var(--foreground)]">Aguardando aprovacao</h1>
      <p className="max-w-sm text-sm leading-7 text-[var(--foreground-soft)]">
        Sua conta foi criada com sucesso e agora depende de aprovacao manual para liberar a operacao.
      </p>
      <form action="/api/auth/logout" method="post">
        <button className="btn-secondary">Sair</button>
      </form>
    </div>
  );
}
