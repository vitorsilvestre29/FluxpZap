import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { linkClientFlow } from '@/server/data/links';
import { formDataToObject } from '@/server/utils/form';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(new URL('/dashboard?error=Sem%20agencia', request.url));
  }

  const formData = await request.formData();
  const data = formDataToObject(formData);

  if (!data.clientId || !data.flowId || !data.instanceId) {
    return NextResponse.redirect(new URL('/dashboard?error=Dados%20incompletos', request.url));
  }

  try {
    await linkClientFlow({
      agencyId: user.agencyId,
      clientId: data.clientId,
      flowId: data.flowId,
      instanceId: data.instanceId,
    });
  } catch {
    return NextResponse.redirect(new URL('/dashboard/links?error=Vinculo%20invalido', request.url));
  }

  return NextResponse.redirect(new URL('/dashboard/links', request.url));
}
