import { prisma } from '@/server/db/prisma';
import { hashPassword } from '@/server/auth/password';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

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

export async function createAgencyWithOwner(data: {
  agencyName: string;
  ownerName?: string;
  ownerEmail: string;
  ownerPassword: string;
  plan: 'STARTER' | 'GROWTH' | 'SCALE';
  maxClients: number;
  maxInstances: number;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.ownerEmail } });
  if (existing) {
    return { success: false as const, error: 'Email ja cadastrado.' };
  }

  const agency = await prisma.agency.create({
    data: {
      name: data.agencyName,
      slug: `${slugify(data.agencyName)}-${Math.random().toString(36).slice(2, 7)}`,
      plan: data.plan,
      maxClients: data.maxClients,
      maxInstances: data.maxInstances,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: data.ownerName || data.agencyName,
      email: data.ownerEmail,
      passwordHash: await hashPassword(data.ownerPassword),
      role: 'AGENCY_ADMIN',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      agencyId: agency.id,
    },
  });

  await prisma.agency.update({
    where: { id: agency.id },
    data: { ownerId: user.id },
  });

  return { success: true as const, agencyId: agency.id, userId: user.id };
}
