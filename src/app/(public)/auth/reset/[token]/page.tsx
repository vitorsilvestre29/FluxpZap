type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function ResetPasswordPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <div className="space-y-7">
      <div>
        <p className="eyebrow">Redefinicao</p>
        <h1 className="display-title mt-4 text-5xl leading-none text-[var(--foreground)]">Nova senha</h1>
        <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--foreground-soft)]">
          Defina uma nova senha para retomar o controle da sua operacao.
        </p>
      </div>

      <form action="/api/auth/reset/confirm" method="post" className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <div className="space-y-2">
          <label className="eyebrow">Senha</label>
          <input name="password" type="password" minLength={8} required />
        </div>
        <button className="btn-primary w-full">Atualizar senha</button>
      </form>
    </div>
  );
}
