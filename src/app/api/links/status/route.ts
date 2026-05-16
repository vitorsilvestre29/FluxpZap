import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { setLinkStatus } from '@/server/data/links';
import { getIntegration } from '@/server/integrations/integration.service';
import { updateEvolutionTypebot, updateEvolutionBot } from '@/server/integrations/evolution';
import { getTypebotConfig } from '@/server/integrations/typebot-config';
import { prisma } from '@/server/db/prisma';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(redirectUrl('/dashboard/links?error=Sem%20agencia', request));
  }

  const data = formDataToObject(await request.formData());
  if (!data.linkId) {
    return NextResponse.redirect(redirectUrl('/dashboard/links', request));
  }

  const newStatus = data.status === 'PAUSED' ? 'PAUSED' : 'ACTIVE';
  await setLinkStatus(user.agencyId, data.linkId, newStatus);

  // Sync enabled/disabled state to Evolution API if the bot is already deployed
  try {
    const link = await prisma.clientFlowLink.findFirst({
      where: { id: data.linkId, client: { agencyId: user.agencyId } },
      include: { flow: true, instance: true },
    });

    if (link?.flow.evolutionBotId) {
      const integration = await getIntegration(user.agencyId, 'EVOLUTION');
      const baseUrl = integration?.baseUrl || process.env.EVOLUTION_BASE_URL || '';
      const evolutionApiKey = integration?.apiKey || process.env.EVOLUTION_API_KEY || '';

      if (baseUrl && evolutionApiKey) {
        const enabled = newStatus === 'ACTIVE';
        if (link.flow.provider === 'TYPEBOT') {
          const typebotConfig = await getTypebotConfig(user.agencyId);
          const typebotUrl = typebotConfig.viewerUrl || typebotConfig.baseUrl;
          const typebotPublicId =
            link.flow.typebotPublicId || link.flow.publishedUrl?.split('/').filter(Boolean).at(-1) || '';
          if (typebotUrl && typebotPublicId) {
            await updateEvolutionTypebot(
              { baseUrl, apiKey: evolutionApiKey },
              link.instance.instanceName,
              link.flow.evolutionBotId,
              {
                enabled,
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
              },
            );
          }
        } else {
          const apiUrl = link.flow.evolutionBotApiUrl || process.env.EVOLUTION_BOT_API_URL || '';
          if (apiUrl) {
            await updateEvolutionBot(
              { baseUrl, apiKey: evolutionApiKey },
              link.instance.instanceName,
              link.flow.evolutionBotId,
              {
                enabled,
                description: link.flow.name,
                apiUrl,
                apiKey: link.flow.evolutionBotApiKey || '',
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
              },
            );
          }
        }
      }
    }
  } catch {
    // Non-fatal: DB status is already updated, Evolution sync is best-effort
  }

  return NextResponse.redirect(redirectUrl('/dashboard/links', request));
}
