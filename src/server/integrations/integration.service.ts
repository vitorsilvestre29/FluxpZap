import { Prisma } from '@prisma/client';

import { prisma } from '../db/prisma';

export async function getAgencyIntegrations(agencyId: string) {
  return prisma.agencyIntegration.findMany({ where: { agencyId } });
}

export async function getIntegration(agencyId: string, type: 'EVOLUTION' | 'TYPEBOT') {
  return prisma.agencyIntegration.findUnique({
    where: {
      agencyId_type: {
        agencyId,
        type,
      },
    },
  });
}

export async function upsertIntegration(
  agencyId: string,
  type: 'EVOLUTION' | 'TYPEBOT',
  input: { baseUrl: string; apiKey?: string | null; metadata?: Record<string, unknown> },
) {
  return prisma.agencyIntegration.upsert({
    where: {
      agencyId_type: {
        agencyId,
        type,
      },
    },
    create: {
      agencyId,
      type,
      baseUrl: input.baseUrl,
      apiKey: input.apiKey ?? null,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
    update: {
      baseUrl: input.baseUrl,
      apiKey: input.apiKey ?? null,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}
