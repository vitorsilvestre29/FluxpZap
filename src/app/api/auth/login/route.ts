import { NextResponse } from 'next/server';

import { login } from '@/server/auth/auth.service';
import { createSession } from '@/server/auth/session';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';
import { consumeRateLimit } from '@/server/security/rate-limit';
import { getClientIp } from '@/server/utils/request';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const ip = getClientIp(request);
    const limiter = consumeRateLimit({
      key: `login:${ip}:${(data.email || '').toLowerCase()}`,
      limit: Number(process.env.LOGIN_RATE_LIMIT_MAX || 12),
      windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
    });

    if (!limiter.allowed) {
      const url = redirectUrl('/auth/login', request);
      url.searchParams.set('error', 'Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      return NextResponse.redirect(url);
    }

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
