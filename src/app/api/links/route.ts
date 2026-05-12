import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { linkClientFlow } from '@/server/data/links';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(redirectUrl('/dashboard?error=Sem%20agencia', request));
  }

  const formData = await request.formData();
  const data = formDataToObject(formData);

  if (!data.clientId || !data.flowId || !data.instanceId) {
    return NextResponse.redirect(redirectUrl('/dashboard?error=Dados%20incompletos', request));
  }

  try {
    await linkClientFlow({
      agencyId: user.agencyId,
      clientId: data.clientId,
      flowId: data.flowId,
      instanceId: data.instanceId,
    });
  } catch {
    return NextResponse.redirect(redirectUrl('/dashboard/links?error=Vinculo%20invalido', request));
  }

  return NextResponse.redirect(redirectUrl('/dashboard/links', request));
}
