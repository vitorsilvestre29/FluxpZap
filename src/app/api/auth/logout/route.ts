import { NextResponse } from 'next/server';

import { destroySession } from '@/server/auth/session';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  await destroySession();
  return NextResponse.redirect(redirectUrl('/auth/login', request));
}
