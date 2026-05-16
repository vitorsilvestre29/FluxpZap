import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { getFlow, deleteFlow } from '@/server/data/flows';
import { getIntegration } from '@/server/integrations/integration.service';
import { prisma } from '@/server/db/prisma';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Sem%20agencia', request));
  }

  const formData = await request.formData();
  const data = formDataToObject(formData);

  if (!data.flowId) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows', request));
  }

  try {
    const flow = await getFlow(user.agencyId, data.flowId);
    if (!flow) {
      return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Fluxo%20nao%20encontrado', request));
    }

    // Disable bot on Evolution API before deleting (best-effort)
    if (flow.evolutionBotId) {
      try {
        const integration = await getIntegration(user.agencyId, 'EVOLUTION');
        const baseUrl = integration?.baseUrl || process.env.EVOLUTION_BASE_URL || '';
        const apiKey = integration?.apiKey || process.env.EVOLUTION_API_KEY || '';

        if (baseUrl && apiKey) {
          const links = await prisma.clientFlowLink.findMany({
            where: { flowId: flow.id },
            include: { instance: true },
          });
          for (const link of links) {
            const endpoint =
              flow.provider === 'TYPEBOT'
                ? `${baseUrl}/typebot/update/${flow.evolutionBotId}/${link.instance.instanceName}`
                : `${baseUrl}/evolutionBot/update/${flow.evolutionBotId}/${link.instance.instanceName}`;
            const method = flow.provider === 'TYPEBOT' ? 'PUT' : 'PUT';
            await fetch(endpoint, {
              method,
              headers: { 'Content-Type': 'application/json', apikey: apiKey },
              body: JSON.stringify({ enabled: false }),
              cache: 'no-store',
            }).catch(() => {});
          }
        }
      } catch {
        // non-fatal
      }
    }

    // Delete in dependency order: sessions → links → flow
    const linkIds = (
      await prisma.clientFlowLink.findMany({
        where: { flowId: flow.id },
        select: { id: true },
      })
    ).map((l) => l.id);

    if (linkIds.length > 0) {
      await prisma.botSession.deleteMany({ where: { linkId: { in: linkIds } } });
      await prisma.clientFlowLink.deleteMany({ where: { flowId: flow.id } });
    }

    await deleteFlow(user.agencyId, data.flowId);
  } catch (err) {
    console.error('Failed to delete flow', err);
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Falha%20ao%20remover%20fluxo', request));
  }

  return NextResponse.redirect(redirectUrl('/dashboard/flows', request));
}
