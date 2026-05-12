import { NextResponse } from 'next/server';

import { requireUser } from '@/server/auth/context';
import { getAgencyUsage } from '@/server/data/agency';
import { createClient, updateClient } from '@/server/data/clients';
import { formDataToObject } from '@/server/utils/form';
import { redirectUrl } from '@/server/utils/url';

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user.agencyId) {
    return NextResponse.redirect(redirectUrl('/dashboard/clients?error=Sem%20agencia', request));
  }

  const formData = await request.formData();
  const data = formDataToObject(formData);

  try {
    if (data.clientId) {
      await updateClient(user.agencyId, data.clientId, {
        name: data.name,
        status: data.status === 'PAUSED' || data.status === 'ARCHIVED' ? data.status : 'ACTIVE',
        whatsappNumber: data.whatsappNumber,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        notes: data.notes,
      });
    } else {
      const usage = await getAgencyUsage(user.agencyId);
      if (usage.agency && usage.clients >= usage.agency.maxClients) {
        return NextResponse.redirect(redirectUrl('/dashboard/clients?error=Limite%20de%20clientes%20atingido', request));
      }

      await createClient(user.agencyId, {
        name: data.name,
        whatsappNumber: data.whatsappNumber,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        notes: data.notes,
      });
    }
  } catch {
    return NextResponse.redirect(redirectUrl('/dashboard/clients?error=Numero%20ja%20cadastrado', request));
  }

  return NextResponse.redirect(redirectUrl('/dashboard/clients', request));
}
