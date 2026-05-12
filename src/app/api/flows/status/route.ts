import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { getFlow, setFlowStatus } from '@/server/data/flows';
import { getTypebotConfig, isTypebotConfigReady } from '@/server/integrations/typebot-config';
import { publishTypebot } from '@/server/integrations/typebot';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Sem%20agencia', request));
  }

  const data = formDataToObject(await request.formData());
  const status =
    data.status === 'READY' || data.status === 'PUBLISHED' || data.status === 'PAUSED'
      ? data.status
      : 'DRAFT';

  if (!data.flowId) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Fluxo%20invalido', request));
  }

  const flow = await getFlow(user.agencyId, data.flowId);
  if (!flow) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Fluxo%20nao%20encontrado', request));
  }

  if (status === 'PUBLISHED' && flow.provider === 'TYPEBOT') {
    if (!flow.typebotId) {
      return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Prepare%20o%20construtor%20antes%20de%20publicar', request));
    }

    const config = await getTypebotConfig(user.agencyId);
    if (!isTypebotConfigReady(config)) {
      return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Configure%20o%20motor%20visual', request));
    }

    try {
      await publishTypebot(config, flow.typebotId);
    } catch (error) {
      console.error('Typebot publish failed', error);
      return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Falha%20ao%20publicar%20fluxo', request));
    }
  }

  await setFlowStatus(user.agencyId, flow.id, status);

  return NextResponse.redirect(redirectUrl('/dashboard/flows', request));
}
