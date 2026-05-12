import { NextResponse } from 'next/server';

import { resetPassword } from '@/server/auth/auth.service';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const formData = await request.formData();
  const data = formDataToObject(formData);

  if (!data.token || !data.password) {
    return NextResponse.redirect(redirectUrl('/auth/reset', request));
  }

  const userId = await resetPassword(data.token, data.password);
  if (!userId) {
    return NextResponse.redirect(redirectUrl('/auth/reset?error=Token%20invalido', request));
  }

  return NextResponse.redirect(redirectUrl('/auth/login?reset=1', request));
}
