import fs from 'node:fs';
import path from 'node:path';
import { config as dotenvConfig } from 'dotenv';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  AppointmentStatus,
  PrismaClient,
  TenantRole,
  UserRole,
} from '@prisma/client';

function loadEnvFiles() {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps/api/.env'),
    path.resolve(__dirname, '../.env'),
  ];

  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      dotenvConfig({ path: envPath, override: false });
    }
  }
}

async function run() {
  loadEnvFiles();

  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not set in environment variables.');
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  const email =
    process.env.SEED_USER_EMAIL?.trim().toLowerCase() ??
    'demo.client@appointment.local';
  const password = process.env.SEED_USER_PASSWORD ?? 'DemoPass123!';
  const fullName = process.env.SEED_USER_NAME ?? 'Demo Client';
  const timezone = process.env.SEED_USER_TIMEZONE ?? 'UTC';
  const passwordHash = await bcrypt.hash(password, 10);
  const tenantName =
    process.env.SEED_TENANT_NAME ?? 'Default Tenant';
  const tenantSlug =
    process.env.SEED_TENANT_SLUG ?? 'default-tenant';

  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash,
        fullName,
        timezone,
        role: UserRole.CLIENT,
        emailVerified: true,
      },
      update: {
        passwordHash,
        fullName,
        timezone,
        emailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationTokenExpiresAt: null,
      },
      select: { id: true, email: true },
    });

    const tenant = await prisma.tenant.upsert({
      where: { slug: tenantSlug },
      create: {
        name: tenantName,
        slug: tenantSlug,
        status: 'ACTIVE',
      },
      update: {
        name: tenantName,
      },
      select: { id: true, slug: true },
    });

    await prisma.tenantMember.upsert({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: user.id,
        },
      },
      create: {
        tenantId: tenant.id,
        userId: user.id,
        role: TenantRole.BUSINESS_ADMIN,
        status: 'ACTIVE',
      },
      update: {
        role: TenantRole.BUSINESS_ADMIN,
        status: 'ACTIVE',
      },
    });

    const existingSeedAppointments = await prisma.appointment.count({
      where: {
        tenantId: tenant.id,
        userId: user.id,
        notes: {
          startsWith: '[seed]',
        },
      },
    });

    if (existingSeedAppointments === 0) {
      const now = new Date();
      const slots = [1, 3, 7].map((daysAhead, idx) => {
        const startsAt = new Date(now);
        startsAt.setUTCDate(now.getUTCDate() + daysAhead);
        startsAt.setUTCHours(14 + idx, 0, 0, 0);
        const endsAt = new Date(startsAt.getTime() + 30 * 60_000);

        return {
          tenantId: tenant.id,
          userId: user.id,
          startsAt,
          endsAt,
          status: AppointmentStatus.SCHEDULED,
          notes: `[seed] demo appointment #${idx + 1}`,
        };
      });

      await prisma.appointment.createMany({ data: slots });
    }

    console.log('Seed completed successfully.');
    console.log(`Demo user: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

void run();
