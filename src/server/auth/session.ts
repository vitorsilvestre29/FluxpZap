import { cookies } from 'next/headers';

import { prisma } from '../db/prisma';
import { addHours, generateToken, hashToken } from './tokens';

const SESSION_COOKIE = 'fz_session';
const SESSION_TTL_HOURS = 24 * 7;

export async function createSession(userId: string) {
  const token = generateToken(32);
  const tokenHash = hashToken(token);
  const expiresAt = addHours(new Date(), SESSION_TTL_HOURS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  });
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });

  if (!session) return null;

  return session.user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.deleteMany({
      where: { tokenHash },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}
