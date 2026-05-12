import { NextResponse } from 'next/server';

import { prisma } from '@/server/db/prisma';
import { signup, createVerificationToken } from '@/server/auth/auth.service';
import { createSession } from '@/server/auth/session';
import { sendMail } from '@/server/utils/mailer';
import { buildUrl, redirectUrl } from '@/server/utils/url';
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

  await sendMail({
    to: user.email,
    subject: 'Confirme seu email',
    html: `Clique para confirmar: ${verifyUrl}`,
  });

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
