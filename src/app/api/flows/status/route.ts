import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { setFlowStatus } from '@/server/data/flows';
import { formDataToObject } from '@/server/utils/form';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(new URL('/dashboard/flows?error=Sem%20agencia', request.url));
  }

  const data = formDataToObject(await request.formData());
  const status =
    data.status === 'READY' || data.status === 'PUBLISHED' || data.status === 'PAUSED'
      ? data.status
      : 'DRAFT';

  if (data.flowId) {
    await setFlowStatus(user.agencyId, data.flowId, status);
  }

  return NextResponse.redirect(new URL('/dashboard/flows', request.url));
}
