import { NextResponse } from 'next/server';

import { verifyEmailToken } from '@/server/auth/auth.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login?error=Token%20invalido', request.url));
  }

  const userId = await verifyEmailToken(token);
  if (!userId) {
    return NextResponse.redirect(new URL('/auth/login?error=Token%20expirado', request.url));
  }

  return NextResponse.redirect(new URL('/auth/login?verified=1', request.url));
}
