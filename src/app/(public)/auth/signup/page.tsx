import Link from "next/link";

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-7">
      <div>
        <p className="eyebrow">Lista de entrada</p>
        <h1 className="display-title mt-4 text-5xl leading-none text-[var(--foreground)]">Criar conta</h1>
        <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--foreground-soft)]">
          Cadastre sua agência para liberar aprovação, ambiente e configuração comercial.
        </p>
      </div>

      {params?.error && (
        <div className="soft-panel rounded-[1.5rem] px-4 py-4 text-sm leading-6 text-[var(--foreground-soft)]">
          {params.error}
        </div>
      )}

      <form action="/api/auth/signup" method="post" className="space-y-4">
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
        <div className="space-y-2">
          <label className="eyebrow">Nome</label>
          <input name="name" required />
        </div>
        <div className="space-y-2">
          <label className="eyebrow">Agência</label>
          <input name="agencyName" required />
        </div>
        <div className="space-y-2">
          <label className="eyebrow">Email</label>
          <input name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <label className="eyebrow">Senha</label>
          <input name="password" type="password" minLength={8} required />
        </div>
        <button className="btn-primary w-full">Solicitar acesso</button>
      </form>

      <p className="text-sm text-[var(--foreground-soft)]">
        Ja tem conta?{" "}
        <Link className="text-[var(--accent)]" href="/auth/login">
          Entrar
        </Link>
      </p>
    </div>
  );
}
