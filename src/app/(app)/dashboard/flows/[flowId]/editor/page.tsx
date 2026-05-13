import { notFound } from 'next/navigation';
import Link from 'next/link';

import { requireUser } from '@/server/auth/context';
import { prisma } from '@/server/db/prisma';

type PageProps = {
  params: { flowId: string };
};

export default async function FlowEditorPage({ params }: PageProps) {
  const user = await requireUser();
  if (!user.agencyId) return notFound();

  const flow = await prisma.typebotFlow.findFirst({
    where: { id: params.flowId, agencyId: user.agencyId },
  });

  if (!flow) return notFound();

  const canOpenEditor = Boolean(flow.typebotId || process.env.TYPEBOT_SSO_SECRET);

  if (!canOpenEditor) {
    return (
      <div className="panel rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Construtor Fluxozap</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">{flow.name}</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">
          Este fluxo ainda nao tem um construtor visual preparado. Configure o motor visual e prepare o editor para
          comecar a desenhar a conversa.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <form action="/api/flows/provision" method="post">
            <input type="hidden" name="flowId" value={flow.id} />
            <button className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-900">
              Preparar construtor
            </button>
          </form>
          <Link href="/dashboard/settings/integrations" className="rounded-full border border-slate-700 px-5 py-2 text-sm text-slate-200">
            Configurar motor visual
          </Link>
          <Link href="/dashboard/flows" className="rounded-full border border-slate-700 px-5 py-2 text-sm text-slate-200">
            Voltar para fluxos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Construtor Fluxozap</p>
        <h1 className="text-2xl font-semibold text-white">{flow.name}</h1>
      </header>
      <div className="panel overflow-hidden rounded-3xl">
        <iframe title="Construtor Fluxozap" src={`/api/typebot/sso?flowId=${flow.id}`} className="h-[80vh] w-full" />
      </div>
    </div>
  );
}
