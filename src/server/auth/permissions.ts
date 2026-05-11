import { UserRole, UserStatus } from '@prisma/client';

export function requireActiveUser(status: UserStatus) {
  return status === 'ACTIVE';
}

export function isAdmin(role: UserRole) {
  return role === 'SUPER_ADMIN';
}
