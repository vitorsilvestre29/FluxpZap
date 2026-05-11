import { Prisma } from '@prisma/client';

import { prisma } from '@/server/db/prisma';

export async function getBotSessions(agencyId: string) {
  return prisma.botSession.findMany({
    where: { agencyId },
    include: {
      client: true,
      link: {
        include: {
          flow: true,
          instance: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });
}

export async function upsertBotSession(data: {
  agencyId: string;
  clientId: string;
  linkId?: string | null;
  remoteJid?: string | null;
  pushName?: string | null;
  status?: 'OPEN' | 'CLOSED' | 'ERROR';
  metadata?: Record<string, unknown>;
}) {
  const remoteJid = data.remoteJid || `manual-${data.clientId}`;

  const existing = await prisma.botSession.findFirst({
    where: {
      agencyId: data.agencyId,
      clientId: data.clientId,
      remoteJid,
      status: 'OPEN',
    },
  });

  if (existing) {
    return prisma.botSession.update({
      where: { id: existing.id },
      data: {
        linkId: data.linkId ?? existing.linkId,
        pushName: data.pushName ?? existing.pushName,
        status: data.status ?? 'OPEN',
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
        metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  return prisma.botSession.create({
    data: {
      agencyId: data.agencyId,
      clientId: data.clientId,
      linkId: data.linkId ?? null,
      remoteJid,
      pushName: data.pushName ?? null,
      status: data.status ?? 'OPEN',
      lastMessageAt: new Date(),
      messageCount: 1,
      metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}
