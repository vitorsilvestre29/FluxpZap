import Link from "next/link";

type PageProps = {
  searchParams?: Promise<{ token?: string }>;
};

export default async function VerifyPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <p className="eyebrow">Confirmacao</p>
      <h1 className="display-title text-5xl leading-none text-[var(--foreground)]">Ativar email</h1>
      <p className="max-w-sm text-sm leading-7 text-[var(--foreground-soft)]">
        Confirme o email para continuar o processo de acesso e liberar a sua conta.
      </p>
      {params?.token ? (
        <Link className="btn-primary" href={`/api/auth/verify?token=${params.token}`}>
          Confirmar email
        </Link>
      ) : (
        <p className="text-sm text-[var(--muted)]">Token nao encontrado.</p>
      )}
    </div>
  );
}
