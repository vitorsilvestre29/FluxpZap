import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || 'Admin Fluxozap';
const agencyName = process.env.ADMIN_AGENCY || 'Fluxozap Admin';

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

if (!email || !password) {
  console.error('Defina ADMIN_EMAIL e ADMIN_PASSWORD para criar o admin.');
  process.exit(1);
}

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
  console.log(`Usuario ja existe: ${email}`);
  await prisma.$disconnect();
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 12);

const agency = await prisma.agency.create({
  data: {
    name: agencyName,
    slug: `${slugify(agencyName)}-${Date.now()}`,
    plan: 'SCALE',
    maxClients: 1000,
    maxInstances: 1000,
  },
});

const user = await prisma.user.create({
  data: {
    name,
    email,
    passwordHash,
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    emailVerifiedAt: new Date(),
    agencyId: agency.id,
  },
});

await prisma.agency.update({
  where: { id: agency.id },
  data: { ownerId: user.id },
});

console.log(`SUPER_ADMIN criado: ${email}`);
await prisma.$disconnect();
