import { UserRole, UserStatus } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../db/prisma';
import { hashPassword, verifyPassword } from './password';
import { addHours, generateToken, hashToken } from './tokens';
import type { AuthResult } from './auth.types';

const signupSchema = z.object({
  name: z.string().min(2, 'Informe seu nome.'),
  email: z.string().email('Email invalido.'),
  password: z.string().min(8, 'Minimo de 8 caracteres.'),
  agencyName: z.string().min(2, 'Informe o nome da agencia.'),
});

const loginSchema = z.object({
  email: z.string().email('Email invalido.'),
  password: z.string().min(8, 'Minimo de 8 caracteres.'),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function signup(input: z.input<typeof signupSchema>): Promise<AuthResult<{ userId: string }>> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Dados invalidos.' };
  }

  const { name, email, password, agencyName } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'Email ja cadastrado.' };
  }

  const usersCount = await prisma.user.count();
  const isFirstUser = usersCount === 0;

  const passwordHash = await hashPassword(password);
  const slugBase = slugify(agencyName);
  const slug = `${slugBase}-${Math.floor(Math.random() * 10000)}`;

  const agency = await prisma.agency.create({
    data: {
      name: agencyName,
      slug,
    },
  });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: isFirstUser ? UserRole.SUPER_ADMIN : UserRole.AGENCY_ADMIN,
      status: isFirstUser ? UserStatus.ACTIVE : UserStatus.PENDING,
      agencyId: agency.id,
    },
  });

  if (isFirstUser) {
    await prisma.agency.update({
      where: { id: agency.id },
      data: { ownerId: user.id },
    });
  }

  return { success: true, data: { userId: user.id } };
}

export async function login(input: z.input<typeof loginSchema>): Promise<AuthResult<{ userId: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Dados invalidos.' };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: 'Credenciais invalidas.' };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: 'Credenciais invalidas.' };
  }

  if (!user.emailVerifiedAt) {
    return { success: false, error: 'Email nao verificado.' };
  }

  if (user.status !== UserStatus.ACTIVE) {
    return { success: false, error: 'Conta pendente de aprovacao.' };
  }

  return { success: true, data: { userId: user.id } };
}

export async function createVerificationToken(userId: string) {
  const token = generateToken(24);
  const tokenHash = hashToken(token);
  const expiresAt = addHours(new Date(), 24);

  await prisma.verificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

export async function verifyEmailToken(token: string) {
  const tokenHash = hashToken(token);
  const record = await prisma.verificationToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) return null;

  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerifiedAt: new Date() },
  });

  return record.userId;
}

export async function createResetToken(userId: string) {
  const token = generateToken(24);
  const tokenHash = hashToken(token);
  const expiresAt = addHours(new Date(), 2);

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) return null;

  const passwordHash = await hashPassword(newPassword);

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });

  return record.userId;
}
