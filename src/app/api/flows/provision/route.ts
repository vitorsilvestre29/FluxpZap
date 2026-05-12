import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { getFlow, setFlowTypebotProvisioning } from '@/server/data/flows';
import { getTypebotConfig, isTypebotConfigReady } from '@/server/integrations/typebot-config';
import { createTypebot } from '@/server/integrations/typebot';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Sem%20agencia', request));
  }

  const data = formDataToObject(await request.formData());
  const flowId = data.flowId;

  if (!flowId) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Fluxo%20invalido', request));
  }

  const flow = await getFlow(user.agencyId, flowId);
  if (!flow) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Fluxo%20nao%20encontrado', request));
  }

  if (flow.typebotId) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows', request));
  }

  const config = await getTypebotConfig(user.agencyId);
  if (!isTypebotConfigReady(config)) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Configure%20o%20motor%20visual', request));
  }

  try {
    const created = await createTypebot(config, {
      name: flow.name,
      description: flow.description,
    });

    if (!created.ok) {
      return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Configure%20o%20motor%20visual', request));
    }

    await setFlowTypebotProvisioning(user.agencyId, flow.id, {
      typebotId: created.typebotId,
      typebotPublicId: created.publicId,
      typebotWorkspaceId: config.workspaceId,
      editorUrl: created.editorUrl,
      publishedUrl: created.publishedUrl,
    });
  } catch (error) {
    console.error('Typebot reprovision failed', error);
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Falha%20ao%20preparar%20construtor', request));
  }

  return NextResponse.redirect(redirectUrl('/dashboard/flows', request));
}
