import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { setFlowEvolutionBotId, setFlowStatus } from '@/server/data/flows';
import { prisma } from '@/server/db/prisma';
import { createEvolutionBot, updateEvolutionBot } from '@/server/integrations/evolution';
import { getIntegration } from '@/server/integrations/integration.service';
import { formDataToObject } from '@/server/utils/form';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(new URL('/dashboard/links?error=Sem%20agencia', request.url));
  }

  const data = formDataToObject(await request.formData());
  const link = data.linkId
    ? await prisma.clientFlowLink.findFirst({
        where: { id: data.linkId, client: { agencyId: user.agencyId } },
        include: { flow: true, instance: true, client: true },
      })
    : null;

  if (!link) {
    return NextResponse.redirect(new URL('/dashboard/links?error=Vinculo%20invalido', request.url));
  }

  if (link.flow.provider !== 'EVOLUTION_BOT') {
    return NextResponse.redirect(new URL('/dashboard/links?error=Este%20fluxo%20nao%20usa%20EvolutionBot', request.url));
  }

  const apiUrl = link.flow.evolutionBotApiUrl || process.env.EVOLUTION_BOT_API_URL || '';
  const apiKey = link.flow.evolutionBotApiKey || process.env.EVOLUTION_BOT_API_KEY || '';

  if (!apiUrl) {
    return NextResponse.redirect(new URL('/dashboard/links?error=Configure%20a%20URL%20do%20seu%20chatbot', request.url));
  }

  const integration = await getIntegration(user.agencyId, 'EVOLUTION');
  const baseUrl = integration?.baseUrl || process.env.EVOLUTION_BASE_URL || '';
  const evolutionApiKey = integration?.apiKey || process.env.EVOLUTION_API_KEY || '';

  if (!baseUrl || !evolutionApiKey) {
    return NextResponse.redirect(new URL('/dashboard/links?error=Configure%20Evolution', request.url));
  }

  const payload = {
    enabled: link.status === 'ACTIVE',
    description: `${link.client.name} - ${link.flow.name}`,
    apiUrl,
    apiKey,
    triggerType: link.flow.triggerType,
    triggerOperator: link.flow.triggerOperator,
    triggerValue: link.flow.triggerValue,
    expire: link.flow.expire,
    keywordFinish: link.flow.keywordFinish,
    delayMessage: link.flow.delayMessage,
    unknownMessage: link.flow.unknownMessage,
    listeningFromMe: link.flow.listeningFromMe,
    stopBotFromMe: link.flow.stopBotFromMe,
    keepOpen: link.flow.keepOpen,
    debounceTime: link.flow.debounceTime,
    ignoreJids: [],
    splitMessages: link.flow.splitMessages,
    timePerChar: link.flow.timePerChar,
  };

  try {
    const response = link.flow.evolutionBotId
      ? await updateEvolutionBot({ baseUrl, apiKey: evolutionApiKey }, link.instance.instanceName, link.flow.evolutionBotId, payload)
      : await createEvolutionBot({ baseUrl, apiKey: evolutionApiKey }, link.instance.instanceName, payload);

    if (!link.flow.evolutionBotId && response?.id) {
      await setFlowEvolutionBotId(user.agencyId, link.flow.id, response.id);
    }

    await setFlowStatus(user.agencyId, link.flow.id, 'PUBLISHED');
  } catch {
    return NextResponse.redirect(new URL('/dashboard/links?error=Falha%20ao%20provisionar%20bot', request.url));
  }

  return NextResponse.redirect(new URL('/dashboard/links', request.url));
}
