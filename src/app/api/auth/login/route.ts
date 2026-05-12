import { NextResponse } from 'next/server';

import { login } from '@/server/auth/auth.service';
import { createSession } from '@/server/auth/session';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = formDataToObject(formData);

    const result = await login({
      email: data.email,
      password: data.password,
    });

    if (!result.success) {
      const url = redirectUrl(result.error.includes('pendente') ? '/auth/pending' : '/auth/login', request);
      url.searchParams.set('error', result.error);
      return NextResponse.redirect(url);
    }

    await createSession(result.data.userId);
    return NextResponse.redirect(redirectUrl('/dashboard', request));
  } catch (error) {
    console.error('Login route failed', error);
    const url = redirectUrl('/auth/login', request);
    url.searchParams.set('error', 'Falha ao entrar. Tente novamente.');
    return NextResponse.redirect(url);
  }
}
