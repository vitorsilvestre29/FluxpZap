import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { getIntegration, upsertIntegration } from '@/server/integrations/integration.service';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(redirectUrl('/dashboard/settings/integrations', request));
  }

  const formData = await request.formData();
  const data = formDataToObject(formData);

  if (data.type === 'EVOLUTION') {
    // Preserve existing apiKey if user left field blank
    const existing = data.apiKey?.trim()
      ? null
      : await getIntegration(user.agencyId, 'EVOLUTION');
    const apiKey = data.apiKey?.trim() || existing?.apiKey || process.env.EVOLUTION_API_KEY || null;

    await upsertIntegration(user.agencyId, 'EVOLUTION', {
      baseUrl: data.baseUrl,
      apiKey,
    });
  }

  if (data.type === 'TYPEBOT') {
    // Preserve existing apiKey if user left field blank
    const existing = data.apiKey?.trim()
      ? null
      : await getIntegration(user.agencyId, 'TYPEBOT');
    const apiKey = data.apiKey?.trim() || existing?.apiKey || process.env.TYPEBOT_API_KEY || null;

    await upsertIntegration(user.agencyId, 'TYPEBOT', {
      baseUrl: data.baseUrl,
      apiKey,
      metadata: {
        editorTemplate: data.editorTemplate,
        apiUrl: data.apiUrl,
        workspaceId: data.workspaceId,
        viewerUrl: data.viewerUrl,
      },
    });
  }

  return NextResponse.redirect(redirectUrl('/dashboard/settings/integrations', request));
}
