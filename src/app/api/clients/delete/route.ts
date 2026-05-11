import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { deleteClient } from '@/server/data/clients';
import { formDataToObject } from '@/server/utils/form';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(new URL('/dashboard/clients?error=Sem%20agencia', request.url));
  }

  const formData = await request.formData();
  const data = formDataToObject(formData);

  if (data.clientId) {
    await deleteClient(user.agencyId, data.clientId);
  }

  return NextResponse.redirect(new URL('/dashboard/clients', request.url));
}
