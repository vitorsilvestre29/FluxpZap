import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { prisma } from '@/server/db/prisma';
import { getFlow, setFlowTypebotProvisioning } from '@/server/data/flows';
import { getIntegration, upsertIntegration } from '@/server/integrations/integration.service';
import {
  buildTypebotEditorUrl,
  createTypebot,
  getDefaultTypebotApiUrl,
  getDefaultTypebotEditorTemplate,
  normalizeTypebotEditorTemplate,
} from '@/server/integrations/typebot';
import { redirectUrl } from '@/server/utils/url';

type TypebotSsoResponse = {
  sessionToken: string;
  expires: string;
  apiKey: string;
  workspaceId: string;
};

export async function GET(request: Request) {
  const user = await requireUser();
  const url = new URL(request.url);
  const flowId = url.searchParams.get('flowId');

  if (!user.agencyId || !flowId) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Fluxo%20invalido', request));
  }

  const flow = await getFlow(user.agencyId, flowId);
  if (!flow) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Fluxo%20nao%20encontrado', request));
  }

  const ssoSecret = process.env.TYPEBOT_SSO_SECRET || process.env.FLUXOZAP_SSO_SECRET;
  const baseUrl = process.env.TYPEBOT_BASE_URL?.replace(/\/$/, '') || '';
  const ssoUrl = process.env.TYPEBOT_SSO_URL || (baseUrl ? `${baseUrl}/api/fluxozap/sso` : '');

  if (!ssoSecret || !ssoUrl || !baseUrl) {
    return NextResponse.redirect(redirectUrl('/dashboard/settings/integrations?error=Configure%20SSO%20do%20Typebot', request));
  }

  const agency = await prisma.agency.findUnique({
    where: { id: user.agencyId },
    select: { name: true, brandName: true },
  });

  let sso: TypebotSsoResponse;
  try {
    const response = await fetch(ssoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-fluxozap-secret': ssoSecret,
      },
      body: JSON.stringify({
        email: user.email,
        name: user.name || user.email,
        workspaceName: agency?.brandName || agency?.name || 'Fluxozap',
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const message = await response.text().catch(() => '');
      throw new Error(`Typebot SSO failed: ${response.status} ${message}`);
    }

    sso = (await response.json()) as TypebotSsoResponse;
  } catch (error) {
    console.error('Typebot SSO failed', error);
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Falha%20ao%20abrir%20construtor', request));
  }

  const currentIntegration = await getIntegration(user.agencyId, 'TYPEBOT');
  const currentMetadata = (currentIntegration?.metadata as Record<string, unknown> | null) ?? {};
  const apiUrl = (currentMetadata.apiUrl as string | undefined) || process.env.TYPEBOT_API_URL || getDefaultTypebotApiUrl(baseUrl);
  const viewerUrl = (currentMetadata.viewerUrl as string | undefined) || process.env.TYPEBOT_VIEWER_URL || null;
  const editorTemplate = normalizeTypebotEditorTemplate(
    process.env.TYPEBOT_EDITOR_TEMPLATE ||
      (currentMetadata.editorTemplate as string | undefined) ||
      getDefaultTypebotEditorTemplate(baseUrl),
  );

  await upsertIntegration(user.agencyId, 'TYPEBOT', {
    baseUrl,
    apiKey: sso.apiKey,
    metadata: {
      ...currentMetadata,
      apiUrl,
      editorTemplate,
      viewerUrl,
      workspaceId: sso.workspaceId,
      managedByFluxozap: true,
      lastSsoAt: new Date().toISOString(),
    },
  });

  let readyFlow = flow;
  if (!readyFlow.typebotId) {
    try {
      const created = await createTypebot(
        {
          baseUrl,
          apiUrl,
          apiKey: sso.apiKey,
          workspaceId: sso.workspaceId,
          editorTemplate,
          viewerUrl,
          maskedBasePath: '/fluxo-builder',
        },
        {
          name: readyFlow.name,
          description: readyFlow.description,
        },
      );

      if (created.ok) {
        await setFlowTypebotProvisioning(user.agencyId, readyFlow.id, {
          typebotId: created.typebotId,
          typebotPublicId: created.publicId,
          typebotWorkspaceId: sso.workspaceId,
          editorUrl: created.editorUrl,
          publishedUrl: created.publishedUrl,
        });

        readyFlow = {
          ...readyFlow,
          typebotId: created.typebotId,
          typebotPublicId: created.publicId,
          typebotWorkspaceId: sso.workspaceId,
          editorUrl: created.editorUrl,
          publishedUrl: created.publishedUrl,
          status: 'READY',
        };
      }
    } catch (error) {
      console.error('Typebot provisioning from SSO failed', error);
      return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Falha%20ao%20preparar%20construtor', request));
    }
  }

  const editorUrl = buildTypebotEditorUrl(
    {
      baseUrl,
      editorTemplate,
    },
    readyFlow,
  );

  if (!editorUrl) {
    return NextResponse.redirect(redirectUrl('/dashboard/flows?error=Construtor%20indisponivel', request));
  }

  const target = new URL(editorUrl, baseUrl);
  const handoffUrl = new URL('/api/fluxozap/sso', baseUrl);
  handoffUrl.searchParams.set('sessionToken', sso.sessionToken);
  handoffUrl.searchParams.set('redirectPath', `${unmaskTypebotPath(target.pathname)}${target.search}${target.hash}`);

  return NextResponse.redirect(handoffUrl);
}

function unmaskTypebotPath(pathname: string) {
  return pathname.replace(/^\/fluxo-builder(?=\/|$)/, '');
}
