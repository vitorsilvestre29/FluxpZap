import { Prisma } from '@prisma/client';

import { prisma } from '@/server/db/prisma';

export async function getInstances(agencyId: string) {
  return prisma.evolutionInstance.findMany({
    where: { agencyId },
    include: {
      client: true,
      links: {
        include: { flow: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getInstanceForAgency(agencyId: string, instanceId: string) {
  return prisma.evolutionInstance.findFirst({
    where: { id: instanceId, agencyId },
    include: { client: true },
  });
}

export async function updateInstanceQr(instanceId: string, qrCode: string | null) {
  return prisma.evolutionInstance.update({
    where: { id: instanceId },
    data: { lastQrCode: qrCode },
  });
}

export async function updateInstanceState(
  agencyId: string,
  instanceId: string,
  data: {
    status: 'PENDING' | 'QR_READY' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
    lastQrCode?: string | null;
    metadata?: Prisma.InputJsonValue;
  },
) {
  return prisma.evolutionInstance.updateMany({
    where: { id: instanceId, agencyId },
    data: {
      status: data.status,
      lastQrCode: data.lastQrCode,
      metadata: data.metadata,
    },
  });
}

export async function createInstanceRecord(data: {
  agencyId: string;
  clientId: string;
  instanceName: string;
  status: 'PENDING' | 'QR_READY' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastQrCode?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return prisma.evolutionInstance.create({
    data: {
      agencyId: data.agencyId,
      clientId: data.clientId,
      instanceName: data.instanceName,
      status: data.status,
      lastQrCode: data.lastQrCode ?? null,
      metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function clientHasInstance(agencyId: string, clientId: string) {
  const count = await prisma.evolutionInstance.count({
    where: { agencyId, clientId },
  });

  return count > 0;
}
