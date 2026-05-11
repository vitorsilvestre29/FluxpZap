import { UserRole, UserStatus } from '@prisma/client';

import { prisma } from '../db/prisma';

export async function getPendingUsers() {
  return prisma.user.findMany({
    where: { status: UserStatus.PENDING },
    include: { agency: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function approveUser(userId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE },
    });

    if (user.agencyId) {
      await tx.agency.updateMany({
        where: {
          id: user.agencyId,
          ownerId: null,
        },
        data: { ownerId: user.id },
      });
    }

    return user;
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { agency: true },
  });
}

export function canAccessAgency(role: UserRole, agencyId: string, userAgencyId?: string | null) {
  if (role === UserRole.SUPER_ADMIN) return true;
  return agencyId === userAgencyId;
}
