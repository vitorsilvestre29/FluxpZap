import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { setLinkStatus } from '@/server/data/links';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(redirectUrl('/dashboard/links?error=Sem%20agencia', request));
  }

  const data = formDataToObject(await request.formData());
  if (data.linkId) {
    await setLinkStatus(user.agencyId, data.linkId, data.status === 'PAUSED' ? 'PAUSED' : 'ACTIVE');
  }

  return NextResponse.redirect(redirectUrl('/dashboard/links', request));
}
