import { prisma } from '@/server/db/prisma';

export async function getDashboardStats(agencyId: string) {
  const [clients, instances, connectedInstances, flows, publishedFlows, activeLinks, openSessions] = await Promise.all([
    prisma.client.count({ where: { agencyId } }),
    prisma.evolutionInstance.count({ where: { agencyId } }),
    prisma.evolutionInstance.count({ where: { agencyId, status: 'CONNECTED' } }),
    prisma.typebotFlow.count({ where: { agencyId } }),
    prisma.typebotFlow.count({ where: { agencyId, status: 'PUBLISHED' } }),
    prisma.clientFlowLink.count({ where: { status: 'ACTIVE', client: { agencyId } } }),
    prisma.botSession.count({ where: { agencyId, status: 'OPEN' } }),
  ]);

  return {
    clients,
    instances,
    connectedInstances,
    flows,
    publishedFlows,
    activeLinks,
    openSessions,
  };
}
