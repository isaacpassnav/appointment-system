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

  const sharedPassword = process.env.SEED_USER_PASSWORD ?? 'DemoPass123!';
  const sharedTimezone = process.env.SEED_USER_TIMEZONE ?? 'America/Lima';
  const passwordHash = await bcrypt.hash(sharedPassword, 10);

  const clinicTenantName = process.env.SEED_TENANT_NAME ?? 'Clinica Dental Sonrisa';
  const clinicTenantSlug = process.env.SEED_TENANT_SLUG ?? 'clinica-dental-sonrisa';

  const demoUsers = [
    {
      key: 'superadmin',
      email: 'demo.superadmin@appointment.local',
      fullName: 'Isaac Superadmin',
      role: UserRole.SUPERADMIN,
    },
    {
      key: 'reseller',
      email: 'demo.reseller@appointment.local',
      fullName: 'Rosa Reseller',
      role: UserRole.RESELLER,
    },
    {
      key: 'admin',
      email: 'demo.admin@appointment.local',
      fullName: 'Diego Business Admin',
      role: UserRole.ADMIN,
    },
    {
      key: 'staff',
      email: 'demo.staff@appointment.local',
      fullName: 'Sofia Staff',
      role: UserRole.STAFF,
    },
    {
      key: 'client',
      email:
        process.env.SEED_USER_EMAIL?.trim().toLowerCase() ??
        'demo.client@appointment.local',
      fullName: process.env.SEED_USER_NAME ?? 'Carlos Client',
      role: UserRole.CLIENT,
    },
  ] as const;

  try {
    const users = await Promise.all(
      demoUsers.map(async (demoUser) => {
        const user = await prisma.user.upsert({
          where: { email: demoUser.email },
          create: {
            email: demoUser.email,
            passwordHash,
            fullName: demoUser.fullName,
            timezone: sharedTimezone,
            role: demoUser.role,
            emailVerified: true,
          },
          update: {
            passwordHash,
            fullName: demoUser.fullName,
            timezone: sharedTimezone,
            role: demoUser.role,
            emailVerified: true,
            emailVerificationTokenHash: null,
            emailVerificationTokenExpiresAt: null,
          },
          select: { id: true, email: true, role: true },
        });

        return {
          ...demoUser,
          id: user.id,
        };
      }),
    );

    const userByKey = Object.fromEntries(
      users.map((user) => [user.key, user]),
    ) as Record<(typeof demoUsers)[number]['key'], (typeof users)[number]>;

    const controlTenant = await prisma.tenant.upsert({
      where: { slug: 'appointmentos-control' },
      create: {
        name: 'AppointmentOS Control',
        slug: 'appointmentos-control',
        status: 'ACTIVE',
      },
      update: {
        name: 'AppointmentOS Control',
        status: 'ACTIVE',
      },
      select: { id: true, name: true },
    });

    const resellerTenant = await prisma.tenant.upsert({
      where: { slug: 'partner-growth-group' },
      create: {
        name: 'Partner Growth Group',
        slug: 'partner-growth-group',
        status: 'ACTIVE',
        resellerId: userByKey.reseller.id,
      },
      update: {
        name: 'Partner Growth Group',
        status: 'ACTIVE',
        resellerId: userByKey.reseller.id,
      },
      select: { id: true, name: true },
    });

    const clinicTenant = await prisma.tenant.upsert({
      where: { slug: clinicTenantSlug },
      create: {
        name: clinicTenantName,
        slug: clinicTenantSlug,
        status: 'ACTIVE',
        resellerId: userByKey.reseller.id,
      },
      update: {
        name: clinicTenantName,
        status: 'ACTIVE',
        resellerId: userByKey.reseller.id,
      },
      select: { id: true, name: true },
    });

    const memberships = [
      {
        tenantId: controlTenant.id,
        userId: userByKey.superadmin.id,
        role: TenantRole.BUSINESS_ADMIN,
      },
      {
        tenantId: resellerTenant.id,
        userId: userByKey.reseller.id,
        role: TenantRole.BUSINESS_ADMIN,
      },
      {
        tenantId: clinicTenant.id,
        userId: userByKey.admin.id,
        role: TenantRole.BUSINESS_ADMIN,
      },
      {
        tenantId: clinicTenant.id,
        userId: userByKey.staff.id,
        role: TenantRole.STAFF,
      },
      {
        tenantId: clinicTenant.id,
        userId: userByKey.client.id,
        role: TenantRole.CLIENT,
      },
    ];

    await Promise.all(
      memberships.map((membership) =>
        prisma.tenantMember.upsert({
          where: {
            tenantId_userId: {
              tenantId: membership.tenantId,
              userId: membership.userId,
            },
          },
          create: {
            ...membership,
            status: 'ACTIVE',
          },
          update: {
            role: membership.role,
            status: 'ACTIVE',
          },
        }),
      ),
    );

    const existingSeedAppointments = await prisma.appointment.count({
      where: {
        tenantId: clinicTenant.id,
        userId: userByKey.client.id,
        notes: {
          startsWith: '[seed]',
        },
      },
    });

    if (existingSeedAppointments === 0) {
      const now = new Date();
      const slots = [
        { daysAhead: 0, hour: 15, note: '[seed] dental cleaning' },
        { daysAhead: 0, hour: 17, note: '[seed] orthodontics review' },
        { daysAhead: 1, hour: 10, note: '[seed] general consultation' },
        { daysAhead: 2, hour: 12, note: '[seed] whitening session' },
      ].map((slot, index) => {
        const startsAt = new Date(now);
        startsAt.setUTCDate(now.getUTCDate() + slot.daysAhead);
        startsAt.setUTCHours(slot.hour + index, 0, 0, 0);
        const endsAt = new Date(startsAt.getTime() + 45 * 60_000);

        return {
          tenantId: clinicTenant.id,
          userId: userByKey.client.id,
          startsAt,
          endsAt,
          status:
            index === 0
              ? AppointmentStatus.CONFIRMED
              : AppointmentStatus.SCHEDULED,
          notes: slot.note,
        };
      });

      await prisma.appointment.createMany({ data: slots });
    }

    console.log('Seed completed successfully.');
    console.log(`Shared password: ${sharedPassword}`);
    console.table(
      users.map((user) => ({
        role: user.role,
        email: user.email,
        tenant:
          user.key === 'superadmin'
            ? controlTenant.name
            : user.key === 'reseller'
              ? resellerTenant.name
              : clinicTenant.name,
      })),
    );
  } finally {
    await prisma.$disconnect();
  }
}

void run();
