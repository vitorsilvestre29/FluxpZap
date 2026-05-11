import { notFound } from 'next/navigation';

import { requireUser } from '@/server/auth/context';
import { prisma } from '@/server/db/prisma';
import { getIntegration } from '@/server/integrations/integration.service';
import { buildTypebotEditorUrl, getDefaultTypebotEditorTemplate } from '@/server/integrations/typebot';

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

  const integration = await getIntegration(user.agencyId, 'TYPEBOT');
  const editorTemplate =
    (integration?.metadata as { editorTemplate?: string } | null)?.editorTemplate ||
    process.env.TYPEBOT_EDITOR_TEMPLATE ||
    getDefaultTypebotEditorTemplate(integration?.baseUrl ?? process.env.TYPEBOT_BASE_URL);

  const editorUrl = flow.editorUrl || (editorTemplate
    ? buildTypebotEditorUrl({
        baseUrl: integration?.baseUrl || process.env.TYPEBOT_BASE_URL || '',
        editorTemplate,
        maskedBasePath: '/_fluxo-builder',
      }, flow)
    : null);

  if (!editorUrl) {
    return (
      <div className="panel rounded-3xl p-6 text-sm text-slate-300">
        Configure o construtor de fluxos em /dashboard/settings/integrations.
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
        <iframe title="Construtor Fluxozap" src={editorUrl} className="h-[80vh] w-full" />
      </div>
    </div>
  );
}
