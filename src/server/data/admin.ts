import { prisma } from '@/server/db/prisma';

export async function getAgencies() {
  return prisma.agency.findMany({
    include: {
      users: true,
      clients: true,
      instances: true,
      flows: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function setAgencyStatus(agencyId: string, status: 'ACTIVE' | 'SUSPENDED') {
  return prisma.agency.update({
    where: { id: agencyId },
    data: { status },
  });
}

export async function setUserStatus(userId: string, status: 'ACTIVE' | 'PENDING' | 'SUSPENDED') {
  return prisma.user.update({
    where: { id: userId },
    data: { status },
  });
}

export async function updateAgencyCommercials(
  agencyId: string,
  data: {
    plan: 'STARTER' | 'GROWTH' | 'SCALE';
    maxClients: number;
    maxInstances: number;
    trialEndsAt?: Date | null;
  },
) {
  return prisma.agency.update({
    where: { id: agencyId },
    data,
  });
}
