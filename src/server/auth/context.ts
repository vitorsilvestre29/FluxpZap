import { redirect } from 'next/navigation';

import { prisma } from '@/server/db/prisma';

import { getSessionUser } from './session';

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect('/auth/login');
  if (user.status === 'PENDING') redirect('/auth/pending');
  if (user.status === 'SUSPENDED') redirect('/auth/login');

  if (user.agencyId) {
    const agency = await prisma.agency.findUnique({
      where: { id: user.agencyId },
      select: { status: true },
    });

    if (agency?.status === 'SUSPENDED') {
      redirect('/auth/login');
    }
  }

  return user;
}

export function resolveAgencyId(user: { role: string; agencyId?: string | null }) {
  if (user.role === 'SUPER_ADMIN') {
    return user.agencyId ?? null;
  }
  return user.agencyId ?? null;
}
