import { prisma } from '@/server/db/prisma';

export async function linkClientFlow(data: {
  agencyId: string;
  clientId: string;
  flowId: string;
  instanceId: string;
}) {
  const [client, flow, instance] = await Promise.all([
    prisma.client.findFirst({ where: { id: data.clientId, agencyId: data.agencyId } }),
    prisma.typebotFlow.findFirst({ where: { id: data.flowId, agencyId: data.agencyId } }),
    prisma.evolutionInstance.findFirst({
      where: {
        id: data.instanceId,
        agencyId: data.agencyId,
        clientId: data.clientId,
      },
    }),
  ]);

  if (!client || !flow || !instance) {
    throw new Error('Vinculo invalido para esta agencia.');
  }

  return prisma.clientFlowLink.upsert({
    where: {
      clientId_flowId: {
        clientId: data.clientId,
        flowId: data.flowId,
      },
    },
    create: {
      clientId: data.clientId,
      flowId: data.flowId,
      instanceId: data.instanceId,
    },
    update: {
      instanceId: data.instanceId,
      status: 'ACTIVE',
    },
  });
}

export async function getLinks(agencyId: string) {
  return prisma.clientFlowLink.findMany({
    where: {
      client: { agencyId },
    },
    include: {
      client: true,
      flow: true,
      instance: true,
      _count: {
        select: { sessions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function setLinkStatus(
  agencyId: string,
  linkId: string,
  status: 'ACTIVE' | 'PAUSED',
) {
  return prisma.clientFlowLink.updateMany({
    where: {
      id: linkId,
      client: { agencyId },
    },
    data: { status },
  });
}

export async function getActiveLinkForInstance(instanceName: string) {
  return prisma.clientFlowLink.findFirst({
    where: {
      status: 'ACTIVE',
      instance: { instanceName },
      client: { status: 'ACTIVE' },
      flow: { status: 'PUBLISHED' },
    },
    include: {
      client: true,
      flow: true,
      instance: true,
    },
  });
}
