import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { updateAgencyProfile } from '@/server/data/agency';
import { formDataToObject } from '@/server/utils/form';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=Sem%20agencia', request.url));
  }

  const data = formDataToObject(await request.formData());

  await updateAgencyProfile(user.agencyId, {
    name: data.name,
    billingEmail: data.billingEmail,
    brandName: data.brandName,
    brandLogoUrl: data.brandLogoUrl,
    primaryColor: data.primaryColor,
  });

  return NextResponse.redirect(new URL('/dashboard/settings', request.url));
}
