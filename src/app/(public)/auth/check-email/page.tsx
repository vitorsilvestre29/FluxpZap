type PageProps = {
  searchParams?: { token?: string };
};

export default function CheckEmailPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-white">Verifique seu email</h1>
      <p className="text-sm text-slate-400">
        Enviamos um link de verificacao. Em ambiente de desenvolvimento, o link aparece abaixo.
      </p>
      {searchParams?.token && (
        <a
          className="inline-flex items-center rounded-full border border-cyan-400/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200"
          href={`/api/auth/verify?token=${searchParams.token}`}
        >
          Validar email (DEV)
        </a>
      )}
      <a className="text-sm text-cyan-200" href="/auth/login">
        Voltar para login
      </a>
    </div>
  );
}
