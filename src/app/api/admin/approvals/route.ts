import { NextResponse } from 'next/server';

import { getSessionUser } from '@/server/auth/session';
import { approveUser, getPendingUsers } from '@/server/auth/user.service';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pending = await getPendingUsers();
  return NextResponse.json({ data: pending });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') || '';
  let userId = '';

  if (contentType.includes('application/json')) {
    const body = await request.json();
    userId = body?.userId;
  } else {
    const formData = await request.formData();
    userId = String(formData.get('userId') || '');
  }

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  await approveUser(userId);
  return NextResponse.redirect(new URL('/dashboard/admin/approvals', request.url));
}
