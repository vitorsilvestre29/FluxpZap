import { NextResponse } from 'next/server';

import { prisma } from '@/server/db/prisma';
import { createResetToken } from '@/server/auth/auth.service';
import { sendMail } from '@/server/utils/mailer';
import { buildUrl, redirectUrl } from '@/server/utils/url';
import { formDataToObject } from '@/server/utils/form';
import { consumeRateLimit } from '@/server/security/rate-limit';
import { getClientIp } from '@/server/utils/request';

export async function POST(request: Request) {
  const formData = await request.formData();
  const data = formDataToObject(formData);
  const ip = getClientIp(request);

  const limiter = consumeRateLimit({
    key: `reset:${ip}:${(data.email || '').toLowerCase()}`,
    limit: Number(process.env.RESET_RATE_LIMIT_MAX || 6),
    windowMs: Number(process.env.RESET_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  });

  if (!limiter.allowed) {
    return NextResponse.redirect(redirectUrl('/auth/reset', request));
  }

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    return NextResponse.redirect(redirectUrl('/auth/reset', request));
  }

  const token = await createResetToken(user.id);
  const resetUrl = buildUrl(`/auth/reset/${token}`);

  try {
    await sendMail({
      to: user.email,
      subject: 'Redefinicao de senha',
      html: `Clique para redefinir: ${resetUrl}`,
    });
  } catch (err) {
    console.error('Failed to send reset email', err);
  }

  const url = redirectUrl('/auth/reset', request);
  if (process.env.NODE_ENV !== 'production') {
    url.searchParams.set('token', token);
  }

  return NextResponse.redirect(url);
}
