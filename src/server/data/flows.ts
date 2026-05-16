import { prisma } from '@/server/db/prisma';

export async function getFlows(agencyId: string) {
  return prisma.typebotFlow.findMany({
    where: { agencyId },
    include: {
      _count: {
        select: { links: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFlow(agencyId: string, flowId: string) {
  return prisma.typebotFlow.findFirst({
    where: { id: flowId, agencyId },
  });
}

export async function createFlow(
  agencyId: string,
  data: {
    name: string;
    description?: string;
    provider?: 'EVOLUTION_BOT' | 'TYPEBOT';
    typebotId?: string;
    typebotPublicId?: string | null;
    typebotWorkspaceId?: string;
    editorUrl?: string;
    publishedUrl?: string;
    evolutionBotApiUrl?: string;
    evolutionBotApiKey?: string;
    status?: 'DRAFT' | 'READY' | 'PUBLISHED' | 'PAUSED';
  },
) {
  return prisma.typebotFlow.create({
    data: {
      agencyId,
      name: data.name,
      description: data.description || null,
      provider: data.provider ?? 'TYPEBOT',
      typebotId: data.typebotId || null,
      typebotPublicId: data.typebotPublicId || null,
      typebotWorkspaceId: data.typebotWorkspaceId || null,
      editorUrl: data.editorUrl || null,
      publishedUrl: data.publishedUrl || null,
      evolutionBotApiUrl: data.evolutionBotApiUrl || null,
      evolutionBotApiKey: data.evolutionBotApiKey || null,
      status: data.status ?? 'DRAFT',
    },
  });
}

export async function updateFlow(
  agencyId: string,
  flowId: string,
  data: {
    name: string;
    description?: string;
    typebotId?: string;
    typebotPublicId?: string;
    typebotWorkspaceId?: string;
    editorUrl?: string;
    publishedUrl?: string;
    provider: 'EVOLUTION_BOT' | 'TYPEBOT';
    evolutionBotApiUrl?: string;
    evolutionBotApiKey?: string;
    triggerType?: string;
    triggerOperator?: string;
    triggerValue?: string;
    keepOpen?: boolean;
    stopBotFromMe?: boolean;
    listeningFromMe?: boolean;
    debounceTime?: number;
    delayMessage?: number;
    unknownMessage?: string;
    keywordFinish?: string;
    expire?: number;
    splitMessages?: boolean;
    timePerChar?: number;
    status: 'DRAFT' | 'READY' | 'PUBLISHED' | 'PAUSED';
  },
) {
  return prisma.typebotFlow.updateMany({
    where: { id: flowId, agencyId },
    data: {
      name: data.name,
      description: data.description || null,
      provider: data.provider,
      typebotId: data.typebotId || null,
      typebotPublicId: data.typebotPublicId || null,
      typebotWorkspaceId: data.typebotWorkspaceId || null,
      editorUrl: data.editorUrl || null,
      publishedUrl: data.publishedUrl || null,
      evolutionBotApiUrl: data.evolutionBotApiUrl || null,
      evolutionBotApiKey: data.evolutionBotApiKey || null,
      triggerType: data.triggerType || 'keyword',
      triggerOperator: data.triggerOperator || null,
      triggerValue: data.triggerValue || null,
      keepOpen: data.keepOpen ?? false,
      stopBotFromMe: data.stopBotFromMe ?? true,
      listeningFromMe: data.listeningFromMe ?? false,
      debounceTime: data.debounceTime ?? 1,
      delayMessage: data.delayMessage ?? 1000,
      unknownMessage: data.unknownMessage ?? '',
      keywordFinish: data.keywordFinish || '#sair',
      expire: data.expire ?? 300,
      splitMessages: data.splitMessages ?? true,
      timePerChar: data.timePerChar ?? 35,
      status: data.status,
    },
  });
}

export async function setFlowEvolutionBotId(agencyId: string, flowId: string, evolutionBotId: string) {
  return prisma.typebotFlow.updateMany({
    where: { id: flowId, agencyId },
    data: { evolutionBotId },
  });
}

export async function setFlowTypebotProvisioning(
  agencyId: string,
  flowId: string,
  data: {
    typebotId: string;
    typebotPublicId?: string | null;
    typebotWorkspaceId?: string | null;
    editorUrl?: string | null;
    publishedUrl?: string | null;
  },
) {
  return prisma.typebotFlow.updateMany({
    where: { id: flowId, agencyId },
    data: {
      typebotId: data.typebotId,
      typebotPublicId: data.typebotPublicId || null,
      typebotWorkspaceId: data.typebotWorkspaceId || null,
      editorUrl: data.editorUrl || null,
      publishedUrl: data.publishedUrl || null,
      status: 'READY',
    },
  });
}

export async function setFlowStatus(
  agencyId: string,
  flowId: string,
  status: 'DRAFT' | 'READY' | 'PUBLISHED' | 'PAUSED',
) {
  return prisma.typebotFlow.updateMany({
    where: { id: flowId, agencyId },
    data: { status },
  });
}

export async function deleteFlow(agencyId: string, flowId: string) {
  return prisma.typebotFlow.deleteMany({
    where: { id: flowId, agencyId },
  });
}
