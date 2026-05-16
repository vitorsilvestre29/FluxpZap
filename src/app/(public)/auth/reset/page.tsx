import Link from "next/link";

type PageProps = {
  searchParams?: Promise<{ token?: string }>;
};

export default async function ResetRequestPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-7">
      <div>
        <p className="eyebrow">Recuperacao</p>
        <h1 className="display-title mt-4 text-5xl leading-none text-[var(--foreground)]">Nova entrada</h1>
        <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--foreground-soft)]">
          Enviaremos um link para redefinir sua senha e devolver acesso ao cockpit.
        </p>
      </div>

      <form action="/api/auth/reset/request" method="post" className="space-y-4">
        <div className="space-y-2">
          <label className="eyebrow">Email</label>
          <input name="email" type="email" required />
        </div>
        <button className="btn-primary w-full">Enviar link</button>
      </form>

      {params?.token && (
        <Link className="btn-warning" href={`/auth/reset/${params.token}`}>
          Redefinir senha (DEV)
        </Link>
      )}

      <Link className="text-sm text-[var(--accent)]" href="/auth/login">
        Voltar para login
      </Link>
    </div>
  );
}
