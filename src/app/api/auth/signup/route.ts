import { NextResponse } from 'next/server';

import { prisma } from '@/server/db/prisma';
import { signup, createVerificationToken } from '@/server/auth/auth.service';
import { createSession } from '@/server/auth/session';
import { sendMail } from '@/server/utils/mailer';
import { buildUrl } from '@/server/utils/url';
import { formDataToObject } from '@/server/utils/form';

export async function POST(request: Request) {
  const formData = await request.formData();
  const data = formDataToObject(formData);

  const result = await signup({
    name: data.name,
    email: data.email,
    password: data.password,
    agencyName: data.agencyName,
  });

  if (!result.success) {
    const url = new URL('/auth/signup', request.url);
    url.searchParams.set('error', result.error);
    return NextResponse.redirect(url);
  }

  const user = await prisma.user.findUnique({ where: { id: result.data.userId } });
  if (!user) {
    return NextResponse.redirect(new URL('/auth/signup', request.url));
  }

  const token = await createVerificationToken(user.id);
  const verifyUrl = buildUrl(`/auth/verify?token=${token}`);

  await sendMail({
    to: user.email,
    subject: 'Confirme seu email',
    html: `Clique para confirmar: ${verifyUrl}`,
  });

  if (user.status === 'ACTIVE') {
    await createSession(user.id);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const redirectUrl = new URL('/auth/check-email', request.url);
  if (process.env.NODE_ENV !== 'production') {
    redirectUrl.searchParams.set('token', token);
  }

  return NextResponse.redirect(redirectUrl);
}
