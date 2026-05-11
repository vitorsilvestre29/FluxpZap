import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { setAgencyStatus, setUserStatus, updateAgencyCommercials } from '@/server/data/admin';
import { formDataToObject } from '@/server/utils/form';

export async function POST(request: Request) {
  const user = await requireUser();
  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = formDataToObject(await request.formData());

  if (data.agencyId) {
    if (data.action === 'commercials') {
      await updateAgencyCommercials(data.agencyId, {
        plan: data.plan === 'SCALE' || data.plan === 'GROWTH' ? data.plan : 'STARTER',
        maxClients: Number(data.maxClients || 10),
        maxInstances: Number(data.maxInstances || 10),
        trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
      });
    } else {
      await setAgencyStatus(data.agencyId, data.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE');
    }
  }

  if (data.userId) {
    const status =
      data.status === 'SUSPENDED' || data.status === 'PENDING' ? data.status : 'ACTIVE';
    await setUserStatus(data.userId, status);
  }

  return NextResponse.redirect(new URL('/dashboard/admin/agencies', request.url));
}
