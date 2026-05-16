import Link from "next/link";

type PageProps = {
  searchParams?: Promise<{ token?: string }>;
};

export default async function CheckEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <p className="eyebrow">Verificacao</p>
      <h1 className="display-title text-5xl leading-none text-[var(--foreground)]">Confira seu email</h1>
      <p className="max-w-sm text-sm leading-7 text-[var(--foreground-soft)]">
        O link de verificacao foi enviado. Em desenvolvimento, o atalho aparece abaixo para acelerar o fluxo.
      </p>
      {params?.token && (
        <Link className="btn-warning" href={`/api/auth/verify?token=${params.token}`}>
          Validar email (DEV)
        </Link>
      )}
      <Link className="text-sm text-[var(--accent)]" href="/auth/login">
        Voltar para login
      </Link>
    </div>
  );
}
