import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { getAgencyUsage } from '@/server/data/agency';
import { getClientForAgency } from '@/server/data/clients';
import { createEvolutionInstance } from '@/server/integrations/evolution';
import { getIntegration } from '@/server/integrations/integration.service';
import { clientHasInstance, createInstanceRecord } from '@/server/data/instances';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(redirectUrl('/dashboard/instances?error=Sem%20agencia', request));
  }

  const formData = await request.formData();
  const data = formDataToObject(formData);

  const client = await getClientForAgency(user.agencyId, data.clientId);
  if (!client) {
    return NextResponse.redirect(redirectUrl('/dashboard/instances?error=Cliente%20invalido', request));
  }

  if (await clientHasInstance(user.agencyId, data.clientId)) {
    return NextResponse.redirect(redirectUrl('/dashboard/instances?error=Cliente%20ja%20tem%20WhatsApp', request));
  }

  const usage = await getAgencyUsage(user.agencyId);
  if (usage.agency && usage.instances >= usage.agency.maxInstances) {
    return NextResponse.redirect(redirectUrl('/dashboard/instances?error=Limite%20de%20instancias%20atingido', request));
  }

  const integration = await getIntegration(user.agencyId, 'EVOLUTION');
  const baseUrl = integration?.baseUrl || process.env.EVOLUTION_BASE_URL || '';
  const apiKey = integration?.apiKey || process.env.EVOLUTION_API_KEY || '';

  if (!baseUrl || !apiKey) {
    return NextResponse.redirect(redirectUrl('/dashboard/instances?error=Configure%20Evolution', request));
  }

  const response = await createEvolutionInstance(
    { baseUrl, apiKey },
    {
      instanceName: data.instanceName,
      qrcode: true,
    },
  );

  const qrCode = response?.qrcode?.base64 || null;

  await createInstanceRecord({
    agencyId: user.agencyId,
    clientId: data.clientId,
    instanceName: data.instanceName,
    status: qrCode ? 'QR_READY' : 'PENDING',
    lastQrCode: qrCode,
    metadata: response as Record<string, unknown>,
  });

  return NextResponse.redirect(redirectUrl('/dashboard/instances', request));
}
