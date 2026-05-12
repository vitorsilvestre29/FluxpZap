import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { getInstanceForAgency, updateInstanceState } from '@/server/data/instances';
import { getEvolutionConnectionState, mapEvolutionStateToInstanceStatus } from '@/server/integrations/evolution';
import { getIntegration } from '@/server/integrations/integration.service';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(redirectUrl('/dashboard/instances?error=Sem%20agencia', request));
  }

  const data = formDataToObject(await request.formData());
  const instance = data.instanceId ? await getInstanceForAgency(user.agencyId, data.instanceId) : null;
  if (!instance) {
    return NextResponse.redirect(redirectUrl('/dashboard/instances?error=Instancia%20invalida', request));
  }

  const integration = await getIntegration(user.agencyId, 'EVOLUTION');
  const baseUrl = integration?.baseUrl || process.env.EVOLUTION_BASE_URL || '';
  const apiKey = integration?.apiKey || process.env.EVOLUTION_API_KEY || '';

  if (!baseUrl || !apiKey) {
    return NextResponse.redirect(redirectUrl('/dashboard/instances?error=Configure%20Evolution', request));
  }

  try {
    const response = await getEvolutionConnectionState({ baseUrl, apiKey }, instance.instanceName);
    const state = response?.instance?.state || response?.state;
    await updateInstanceState(user.agencyId, instance.id, {
      status: mapEvolutionStateToInstanceStatus(state),
      metadata: response as Prisma.InputJsonValue,
    });
  } catch {
    await updateInstanceState(user.agencyId, instance.id, { status: 'ERROR' });
  }

  return NextResponse.redirect(redirectUrl('/dashboard/instances', request));
}
