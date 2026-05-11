import { NextResponse } from 'next/server';

import { prisma } from '@/server/db/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      service: 'fluxozap',
      database: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        service: 'fluxozap',
        database: 'error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
