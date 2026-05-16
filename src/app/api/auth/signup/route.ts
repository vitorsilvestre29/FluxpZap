import { NextResponse } from 'next/server';

import { prisma } from '@/server/db/prisma';
import { signup, createVerificationToken } from '@/server/auth/auth.service';
import { createSession } from '@/server/auth/session';
import { sendMail } from '@/server/utils/mailer';
import { buildUrl, redirectUrl } from '@/server/utils/url';
import { formDataToObject } from '@/server/utils/form';
import { consumeRateLimit } from '@/server/security/rate-limit';
import { getClientIp } from '@/server/utils/request';

export async function POST(request: Request) {
  const formData = await request.formData();
  const data = formDataToObject(formData);
  const ip = getClientIp(request);

  if (data.website) {
    return NextResponse.redirect(redirectUrl('/auth/check-email', request));
  }

  const limiter = consumeRateLimit({
    key: `signup:${ip}:${(data.email || '').toLowerCase()}`,
    limit: Number(process.env.SIGNUP_RATE_LIMIT_MAX || 8),
    windowMs: Number(process.env.SIGNUP_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
  });

  if (!limiter.allowed) {
    const url = redirectUrl('/auth/signup', request);
    url.searchParams.set('error', 'Muitas tentativas. Tente novamente em instantes.');
    return NextResponse.redirect(url);
  }

  const result = await signup({
    name: data.name,
    email: data.email,
    password: data.password,
    agencyName: data.agencyName,
  });

  if (!result.success) {
    const url = redirectUrl('/auth/signup', request);
    url.searchParams.set('error', result.error);
    return NextResponse.redirect(url);
  }

  const user = await prisma.user.findUnique({ where: { id: result.data.userId } });
  if (!user) {
    return NextResponse.redirect(redirectUrl('/auth/signup', request));
  }

  const token = await createVerificationToken(user.id);
  const verifyUrl = buildUrl(`/auth/verify?token=${token}`);

  try {
    await sendMail({
      to: user.email,
      subject: 'Confirme seu email',
      html: `Clique para confirmar: ${verifyUrl}`,
    });
  } catch (err) {
    console.error('Failed to send verification email', err);
    // Continue — user can request a new email later
  }

  if (user.status === 'ACTIVE') {
    await createSession(user.id);
    return NextResponse.redirect(redirectUrl('/dashboard', request));
  }

  const url = redirectUrl('/auth/check-email', request);
  if (process.env.NODE_ENV !== 'production') {
    url.searchParams.set('token', token);
  }

  return NextResponse.redirect(url);
}
