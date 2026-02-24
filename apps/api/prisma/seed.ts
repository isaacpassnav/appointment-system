import fs from 'node:fs';
import path from 'node:path';
import { config as dotenvConfig } from 'dotenv';
import bcrypt from 'bcrypt';
import {
  AppointmentStatus,
  PrismaClient,
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

  const prisma = new PrismaClient();
  const email =
    process.env.SEED_USER_EMAIL?.trim().toLowerCase() ??
    'demo.client@appointment.local';
  const password = process.env.SEED_USER_PASSWORD ?? 'DemoPass123!';
  const fullName = process.env.SEED_USER_NAME ?? 'Demo Client';
  const timezone = process.env.SEED_USER_TIMEZONE ?? 'UTC';
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash,
        fullName,
        timezone,
        role: UserRole.CLIENT,
      },
      update: {
        passwordHash,
        fullName,
        timezone,
      },
      select: { id: true, email: true },
    });

    const existingSeedAppointments = await prisma.appointment.count({
      where: {
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
