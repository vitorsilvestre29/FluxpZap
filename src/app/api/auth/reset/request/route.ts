import { NextResponse } from 'next/server';

import { prisma } from '@/server/db/prisma';
import { createResetToken } from '@/server/auth/auth.service';
import { sendMail } from '@/server/utils/mailer';
import { buildUrl } from '@/server/utils/url';
import { formDataToObject } from '@/server/utils/form';

export async function POST(request: Request) {
  const formData = await request.formData();
  const data = formDataToObject(formData);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    return NextResponse.redirect(new URL('/auth/reset', request.url));
  }

  const token = await createResetToken(user.id);
  const resetUrl = buildUrl(`/auth/reset/${token}`);

  await sendMail({
    to: user.email,
    subject: 'Redefinicao de senha',
    html: `Clique para redefinir: ${resetUrl}`,
  });

  const redirectUrl = new URL('/auth/reset', request.url);
  if (process.env.NODE_ENV !== 'production') {
    redirectUrl.searchParams.set('token', token);
  }

  return NextResponse.redirect(redirectUrl);
}
