import { NextResponse } from 'next/server';

import { resetPassword } from '@/server/auth/auth.service';
import { formDataToObject } from '@/server/utils/form';

export async function POST(request: Request) {
  const formData = await request.formData();
  const data = formDataToObject(formData);

  if (!data.token || !data.password) {
    return NextResponse.redirect(new URL('/auth/reset', request.url));
  }

  const userId = await resetPassword(data.token, data.password);
  if (!userId) {
    return NextResponse.redirect(new URL('/auth/reset?error=Token%20invalido', request.url));
  }

  return NextResponse.redirect(new URL('/auth/login?reset=1', request.url));
}
