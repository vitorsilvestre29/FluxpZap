import { NextResponse } from 'next/server';

import { verifyEmailToken } from '@/server/auth/auth.service';
import { redirectUrl } from '@/server/utils/url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(redirectUrl('/auth/login?error=Token%20invalido', request));
  }

  const userId = await verifyEmailToken(token);
  if (!userId) {
    return NextResponse.redirect(redirectUrl('/auth/login?error=Token%20expirado', request));
  }

  return NextResponse.redirect(redirectUrl('/auth/login?verified=1', request));
}
