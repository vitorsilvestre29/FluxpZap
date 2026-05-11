import { prisma } from '@/server/db/prisma';

export async function getAgencyById(agencyId: string) {
  return prisma.agency.findUnique({ where: { id: agencyId } });
}

export async function getAgencyUsage(agencyId: string) {
  const [agency, clients, instances, flows, activeLinks] = await Promise.all([
    prisma.agency.findUnique({ where: { id: agencyId } }),
    prisma.client.count({ where: { agencyId } }),
    prisma.evolutionInstance.count({ where: { agencyId } }),
    prisma.typebotFlow.count({ where: { agencyId } }),
    prisma.clientFlowLink.count({ where: { client: { agencyId }, status: 'ACTIVE' } }),
  ]);

  return { agency, clients, instances, flows, activeLinks };
}

export async function updateAgencyProfile(
  agencyId: string,
  data: {
    name: string;
    billingEmail?: string;
    brandName?: string;
    brandLogoUrl?: string;
    primaryColor?: string;
  },
) {
  return prisma.agency.update({
    where: { id: agencyId },
    data: {
      name: data.name,
      billingEmail: data.billingEmail || null,
      brandName: data.brandName || null,
      brandLogoUrl: data.brandLogoUrl || null,
      primaryColor: data.primaryColor || null,
    },
  });
}
