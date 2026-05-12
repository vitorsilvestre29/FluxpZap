import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { createAgencyWithOwner, setAgencyStatus, setUserStatus, updateAgencyCommercials } from '@/server/data/admin';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const user = await requireUser();
  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = formDataToObject(await request.formData());

  if (data.action === 'create') {
    if (!data.agencyName || !data.ownerEmail || !data.ownerPassword || data.ownerPassword.length < 8) {
      return NextResponse.redirect(redirectUrl('/dashboard/admin/agencies?error=Dados%20incompletos', request));
    }

    const result = await createAgencyWithOwner({
      agencyName: data.agencyName,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      ownerPassword: data.ownerPassword,
      plan: data.plan === 'SCALE' || data.plan === 'GROWTH' ? data.plan : 'STARTER',
      maxClients: Number(data.maxClients || 10),
      maxInstances: Number(data.maxInstances || 10),
    });

    if (!result.success) {
      const url = redirectUrl('/dashboard/admin/agencies', request);
      url.searchParams.set('error', result.error);
      return NextResponse.redirect(url);
    }
  }

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

  return NextResponse.redirect(redirectUrl('/dashboard/admin/agencies', request));
}
