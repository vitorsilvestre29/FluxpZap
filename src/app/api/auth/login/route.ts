import { NextResponse } from 'next/server';

import { login } from '@/server/auth/auth.service';
import { createSession } from '@/server/auth/session';
import { formDataToObject } from '@/server/utils/form';

export async function POST(request: Request) {
  const formData = await request.formData();
  const data = formDataToObject(formData);

  const result = await login({
    email: data.email,
    password: data.password,
  });

  if (!result.success) {
    const redirectUrl = new URL(
      result.error.includes('pendente') ? '/auth/pending' : '/auth/login',
      request.url,
    );
    redirectUrl.searchParams.set('error', result.error);
    return NextResponse.redirect(redirectUrl);
  }

  await createSession(result.data.userId);
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
