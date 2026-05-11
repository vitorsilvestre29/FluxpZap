type PageProps = {
  searchParams?: { token?: string };
};

export default function VerifyPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Verificar email</h1>
      <p className="text-sm text-slate-400">
        Clique abaixo para confirmar seu email.
      </p>
      {searchParams?.token ? (
        <a
          className="inline-flex items-center rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900"
          href={`/api/auth/verify?token=${searchParams.token}`}
        >
          Confirmar email
        </a>
      ) : (
        <p className="text-sm text-slate-500">Token nao encontrado.</p>
      )}
    </div>
  );
}
