import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { createFlow, updateFlow } from '@/server/data/flows';
import { getTypebotConfig } from '@/server/integrations/typebot-config';
import { createTypebot } from '@/server/integrations/typebot';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Sem%20agencia', request));
  }

  const formData = await request.formData();
  const data = formDataToObject(formData);
  const provider = data.provider === 'EVOLUTION_BOT' ? 'EVOLUTION_BOT' : 'TYPEBOT';

  if (data.flowId) {
    await updateFlow(user.agencyId, data.flowId, {
      name: data.name,
      description: data.description,
      provider,
      typebotId: data.typebotId,
      typebotWorkspaceId: data.typebotWorkspaceId,
      editorUrl: data.editorUrl,
      publishedUrl: data.publishedUrl,
      evolutionBotApiUrl: data.evolutionBotApiUrl,
      evolutionBotApiKey: data.evolutionBotApiKey,
      triggerType: data.triggerType,
      triggerOperator: data.triggerOperator,
      triggerValue: data.triggerValue,
      keepOpen: data.keepOpen === 'on',
      stopBotFromMe: data.stopBotFromMe === 'on',
      listeningFromMe: data.listeningFromMe === 'on',
      debounceTime: Number(data.debounceTime || 1),
      delayMessage: Number(data.delayMessage || 1000),
      unknownMessage: data.unknownMessage,
      keywordFinish: data.keywordFinish,
      expire: Number(data.expire || 300),
      splitMessages: data.splitMessages === 'on',
      timePerChar: Number(data.timePerChar || 35),
      status:
        data.status === 'READY' || data.status === 'PUBLISHED' || data.status === 'PAUSED'
          ? data.status
          : 'DRAFT',
    });
  } else {
    let typebotData: {
      typebotId?: string | null;
      typebotWorkspaceId?: string | null;
      editorUrl?: string | null;
      publishedUrl?: string | null;
    } = {};

    if (provider === 'TYPEBOT') {
      const typebotConfig = await getTypebotConfig(user.agencyId);

      try {
        const created = await createTypebot(
          typebotConfig,
          {
            name: data.name,
            description: data.description,
          },
        );

        if (created.ok) {
          typebotData = {
            typebotId: created.typebotId,
            typebotWorkspaceId: typebotConfig.workspaceId,
            editorUrl: created.editorUrl,
            publishedUrl: created.publishedUrl,
          };
        }
      } catch (error) {
        console.error('Typebot provisioning failed', error);
      }
    }

    await createFlow(user.agencyId, {
      name: data.name,
      description: data.description,
      provider,
      typebotId: typebotData.typebotId || data.typebotId,
      typebotWorkspaceId: typebotData.typebotWorkspaceId || data.typebotWorkspaceId,
      editorUrl: typebotData.editorUrl || data.editorUrl,
      publishedUrl: typebotData.publishedUrl || data.publishedUrl,
      evolutionBotApiUrl: data.evolutionBotApiUrl,
      evolutionBotApiKey: data.evolutionBotApiKey,
      status: typebotData.typebotId ? 'READY' : 'DRAFT',
    });
  }

  return NextResponse.redirect(redirectUrl('/dashboard/flows', request));
}
