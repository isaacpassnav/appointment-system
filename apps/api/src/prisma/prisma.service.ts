import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required to initialize Prisma.');
    }

    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const hint =
        'Database TLS handshake failed. For Supabase pooler with Prisma adapter-pg, use DATABASE_URL with sslmode=no-verify (or uselibpqcompat=true&sslmode=require).';
      throw new Error(`${message}\n${hint}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
