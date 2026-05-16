import Link from "next/link";

type PageProps = {
  searchParams?: Promise<{ error?: string; verified?: string; reset?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-7">
      <div>
        <p className="eyebrow">Fluxozap Access</p>
        <h1 className="display-title mt-4 text-5xl leading-none text-[var(--foreground)]">Entrar no cockpit</h1>
        <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--foreground-soft)]">
          Acesse sua operação, acompanhe clientes ativos e publique fluxos sem sair do painel.
        </p>
      </div>

      {(params?.error || params?.verified || params?.reset) && (
        <div className="soft-panel rounded-[1.5rem] px-4 py-4 text-sm leading-6 text-[var(--foreground-soft)]">
          {params?.error && <p>{params.error}</p>}
          {params?.verified && <p>Email verificado com sucesso.</p>}
          {params?.reset && <p>Senha atualizada. Faça login.</p>}
        </div>
      )}

      <form action="/api/auth/login" method="post" className="space-y-4">
        <div className="space-y-2">
          <label className="eyebrow">Email</label>
          <input name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <label className="eyebrow">Senha</label>
          <input name="password" type="password" required />
        </div>
        <button className="btn-primary w-full">Entrar</button>
      </form>

      <div className="flex flex-col gap-3 text-sm text-[var(--foreground-soft)]">
        <Link className="text-[var(--accent)]" href="/auth/reset">
          Esqueci minha senha
        </Link>
        <Link className="text-[var(--accent)]" href="/auth/signup">
          Criar conta
        </Link>
      </div>
    </div>
  );
}
