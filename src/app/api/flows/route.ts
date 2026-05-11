import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { createFlow, updateFlow } from '@/server/data/flows';
import { formDataToObject } from '@/server/utils/form';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(new URL('/dashboard/flows?error=Sem%20agencia', request.url));
  }

  const formData = await request.formData();
  const data = formDataToObject(formData);

  if (data.flowId) {
    await updateFlow(user.agencyId, data.flowId, {
      name: data.name,
      description: data.description,
      provider: data.provider === 'EVOLUTION_BOT' ? 'EVOLUTION_BOT' : 'TYPEBOT',
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
    await createFlow(user.agencyId, {
      name: data.name,
      description: data.description,
      provider: data.provider === 'EVOLUTION_BOT' ? 'EVOLUTION_BOT' : 'TYPEBOT',
      typebotId: data.typebotId,
      publishedUrl: data.publishedUrl,
      evolutionBotApiUrl: data.evolutionBotApiUrl,
      evolutionBotApiKey: data.evolutionBotApiKey,
    });
  }

  return NextResponse.redirect(new URL('/dashboard/flows', request.url));
}
