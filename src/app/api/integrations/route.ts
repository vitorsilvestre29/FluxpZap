import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { upsertIntegration } from '@/server/integrations/integration.service';
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
    await upsertIntegration(user.agencyId, 'EVOLUTION', {
      baseUrl: data.baseUrl,
      apiKey: data.apiKey,
    });
  }

  if (data.type === 'TYPEBOT') {
    await upsertIntegration(user.agencyId, 'TYPEBOT', {
      baseUrl: data.baseUrl,
      apiKey: data.apiKey,
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
