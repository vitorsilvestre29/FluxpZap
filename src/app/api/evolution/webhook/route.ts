import { NextResponse } from 'next/server';

import { getActiveLinkForInstance } from '@/server/data/links';
import { upsertBotSession } from '@/server/data/sessions';

export async function POST(request: Request) {
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET;
  if (secret && request.headers.get('x-fluxozap-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const instanceName =
    body?.instance ||
    body?.instanceName ||
    body?.data?.instance ||
    body?.data?.instanceName;

  if (!instanceName) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const link = await getActiveLinkForInstance(instanceName);
  if (!link) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const remoteJid =
    body?.data?.key?.remoteJid ||
    body?.data?.remoteJid ||
    body?.remoteJid ||
    null;
  const pushName = body?.data?.pushName || body?.pushName || null;

  await upsertBotSession({
    agencyId: link.client.agencyId,
    clientId: link.clientId,
    linkId: link.id,
    remoteJid,
    pushName,
    metadata: body,
  });

  return NextResponse.json({ ok: true });
}
