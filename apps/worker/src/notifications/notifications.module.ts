import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import path from 'path';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NOTIFICATIONS_QUEUE_NAME } from './notifications.constants';
import { NotificationsProcessor } from './notifications.processor';

type BullRedisConnection = {
  host: string;
  port: number;
  username?: string;
  password?: string;
  tls?: Record<string, never>;
  maxRetriesPerRequest: null;
  enableReadyCheck: false;
};

function buildBullConnection(redisUrl: string): BullRedisConnection {
  const parsed = new URL(redisUrl);
  const isTls = parsed.protocol === 'rediss:';

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : isTls ? 6380 : 6379,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    tls: isTls ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

function resolveRedisUrl(configService: ConfigService) {
  const direct = configService.get<string>('REDIS_URL')?.trim();
  if (direct) {
    return direct;
  }

  const upstashRestUrl = configService
    .get<string>('UPSTASH_REDIS_REST_URL')
    ?.trim();
  const upstashToken = configService
    .get<string>('UPSTASH_REDIS_REST_TOKEN')
    ?.trim();

  if (!upstashRestUrl || !upstashToken) {
    return undefined;
  }

  const host = new URL(upstashRestUrl).host;
  return `rediss://default:${upstashToken}@${host}:6379`;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), 'apps/worker/.env'),
      ],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = resolveRedisUrl(configService);
        if (!redisUrl) {
          throw new Error(
            'Redis config is required. Set REDIS_URL or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.',
          );
        }

        return {
          connection: buildBullConnection(redisUrl),
        };
      },
    }),
    BullModule.registerQueue({
      name: NOTIFICATIONS_QUEUE_NAME,
    }),
    PrismaModule,
    MailModule,
  ],
  providers: [NotificationsProcessor],
})
export class NotificationsModule {}
