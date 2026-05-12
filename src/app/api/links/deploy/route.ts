import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { setFlowEvolutionBotId, setFlowStatus } from '@/server/data/flows';
import { prisma } from '@/server/db/prisma';
import {
  createEvolutionBot,
  createEvolutionTypebot,
  updateEvolutionBot,
  updateEvolutionTypebot,
} from '@/server/integrations/evolution';
import { getTypebotConfig } from '@/server/integrations/typebot-config';
import { getIntegration } from '@/server/integrations/integration.service';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(redirectUrl('/dashboard/links?error=Sem%20agencia', request));
  }

  const data = formDataToObject(await request.formData());
  const link = data.linkId
    ? await prisma.clientFlowLink.findFirst({
        where: { id: data.linkId, client: { agencyId: user.agencyId } },
        include: { flow: true, instance: true, client: true },
      })
    : null;

  if (!link) {
    return NextResponse.redirect(redirectUrl('/dashboard/links?error=Vinculo%20invalido', request));
  }

  const integration = await getIntegration(user.agencyId, 'EVOLUTION');
  const baseUrl = integration?.baseUrl || process.env.EVOLUTION_BASE_URL || '';
  const evolutionApiKey = integration?.apiKey || process.env.EVOLUTION_API_KEY || '';

  if (!baseUrl || !evolutionApiKey) {
    return NextResponse.redirect(redirectUrl('/dashboard/links?error=Configure%20Evolution', request));
  }

  try {
    if (link.flow.provider === 'TYPEBOT') {
      const typebotConfig = await getTypebotConfig(user.agencyId);
      const typebotUrl = typebotConfig.viewerUrl || typebotConfig.baseUrl;
      const typebotPublicId = link.flow.typebotPublicId || getPublicIdFromUrl(link.flow.publishedUrl) || '';

      if (!typebotUrl || !typebotPublicId) {
        return NextResponse.redirect(redirectUrl('/dashboard/links?error=Prepare%20e%20publique%20o%20fluxo%20visual', request));
      }

      const payload = {
        enabled: link.status === 'ACTIVE',
        url: typebotUrl,
        typebot: typebotPublicId,
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
      };

      const response = link.flow.evolutionBotId
        ? await updateEvolutionTypebot(
            { baseUrl, apiKey: evolutionApiKey },
            link.instance.instanceName,
            link.flow.evolutionBotId,
            payload,
          )
        : await createEvolutionTypebot({ baseUrl, apiKey: evolutionApiKey }, link.instance.instanceName, payload);

      if (!link.flow.evolutionBotId && response?.id) {
        await setFlowEvolutionBotId(user.agencyId, link.flow.id, response.id);
      }
    } else {
      const apiUrl = link.flow.evolutionBotApiUrl || process.env.EVOLUTION_BOT_API_URL || '';
      const apiKey = link.flow.evolutionBotApiKey || process.env.EVOLUTION_BOT_API_KEY || '';

      if (!apiUrl) {
        return NextResponse.redirect(redirectUrl('/dashboard/links?error=Configure%20a%20URL%20do%20seu%20chatbot', request));
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

      const response = link.flow.evolutionBotId
        ? await updateEvolutionBot(
            { baseUrl, apiKey: evolutionApiKey },
            link.instance.instanceName,
            link.flow.evolutionBotId,
            payload,
          )
        : await createEvolutionBot({ baseUrl, apiKey: evolutionApiKey }, link.instance.instanceName, payload);

      if (!link.flow.evolutionBotId && response?.id) {
        await setFlowEvolutionBotId(user.agencyId, link.flow.id, response.id);
      }
    }

    await setFlowStatus(user.agencyId, link.flow.id, 'PUBLISHED');
  } catch {
    return NextResponse.redirect(redirectUrl('/dashboard/links?error=Falha%20ao%20provisionar%20bot', request));
  }

  return NextResponse.redirect(redirectUrl('/dashboard/links', request));
}

function getPublicIdFromUrl(url?: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.pathname.split('/').filter(Boolean).at(-1) || null;
  } catch {
    return url.split('/').filter(Boolean).at(-1) || null;
  }
}
