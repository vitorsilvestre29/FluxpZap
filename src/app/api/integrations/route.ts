import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { upsertIntegration } from '@/server/integrations/integration.service';
import { formDataToObject } from '@/server/utils/form';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(new URL('/dashboard/settings/integrations', request.url));
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
      },
    });
  }

  return NextResponse.redirect(new URL('/dashboard/settings/integrations', request.url));
}
