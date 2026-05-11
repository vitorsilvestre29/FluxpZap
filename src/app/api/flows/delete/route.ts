import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { deleteFlow } from '@/server/data/flows';
import { formDataToObject } from '@/server/utils/form';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(new URL('/dashboard/flows?error=Sem%20agencia', request.url));
  }

  const formData = await request.formData();
  const data = formDataToObject(formData);

  if (data.flowId) {
    await deleteFlow(user.agencyId, data.flowId);
  }

  return NextResponse.redirect(new URL('/dashboard/flows', request.url));
}
