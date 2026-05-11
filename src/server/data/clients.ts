import { prisma } from '@/server/db/prisma';

export async function getClients(agencyId: string) {
  return prisma.client.findMany({
    where: { agencyId },
    include: {
      instances: true,
      links: {
        include: {
          flow: true,
          instance: true,
        },
      },
      _count: {
        select: { botSessions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getClientForAgency(agencyId: string, clientId: string) {
  return prisma.client.findFirst({
    where: { id: clientId, agencyId },
    include: { instances: true },
  });
}

export async function createClient(agencyId: string, data: {
  name: string;
  whatsappNumber?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}) {
  return prisma.client.create({
    data: {
      agencyId,
      name: data.name,
      whatsappNumber: data.whatsappNumber || null,
      contactName: data.contactName || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      notes: data.notes || null,
    },
  });
}

export async function updateClient(
  agencyId: string,
  clientId: string,
  data: {
    name: string;
    status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
    whatsappNumber?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    notes?: string;
  },
) {
  return prisma.client.updateMany({
    where: { id: clientId, agencyId },
    data: {
      name: data.name,
      status: data.status,
      whatsappNumber: data.whatsappNumber || null,
      contactName: data.contactName || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      notes: data.notes || null,
    },
  });
}

export async function deleteClient(agencyId: string, clientId: string) {
  return prisma.client.deleteMany({
    where: { id: clientId, agencyId },
  });
}
