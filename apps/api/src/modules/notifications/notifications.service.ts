import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { MailService } from '../mail/mail.service';
import type { NotificationJobData } from './notification-job.types';
import {
  NOTIFICATION_JOB_VERIFY_EMAIL,
  NOTIFICATION_JOB_WELCOME_EMAIL,
  NOTIFICATIONS_QUEUE_NAME,
} from './notifications.constants';

@Injectable()
export class NotificationsService implements OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly queue: Queue | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    const redisUrl = this.resolveRedisUrl();
    if (!redisUrl) {
      this.queue = null;
      this.logger.warn(
        'Redis config is missing. Set REDIS_URL or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN. Notifications fallback to synchronous email sending.',
      );
      return;
    }

    this.logger.log(`Notifications queue enabled on ${new URL(redisUrl).host}`);

    this.queue = new Queue(NOTIFICATIONS_QUEUE_NAME, {
      connection: this.buildQueueConnection(redisUrl),
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2_000,
        },
        removeOnComplete: 200,
        removeOnFail: 500,
      },
    });
  }

  async enqueueWelcomeEmail(params: { to: string; fullName: string }) {
    await this.enqueueOrFallback({
      type: NOTIFICATION_JOB_WELCOME_EMAIL,
      to: params.to,
      fullName: params.fullName,
    });
  }

  async enqueueVerifyEmail(params: {
    to: string;
    fullName: string;
    verifyUrl: string;
  }) {
    await this.enqueueOrFallback({
      type: NOTIFICATION_JOB_VERIFY_EMAIL,
      to: params.to,
      fullName: params.fullName,
      verifyUrl: params.verifyUrl,
    });
  }

  async onModuleDestroy() {
    await Promise.allSettled([this.queue?.close()]);
  }

  private async enqueueOrFallback(jobData: NotificationJobData) {
    if (this.queue) {
      await this.queue.add(jobData.type, jobData);
      return;
    }

    // Fallback to keep local/dev environments usable without Redis.
    await this.sendEmailDirectly(jobData);
  }

  private async sendEmailDirectly(jobData: NotificationJobData) {
    if (jobData.type === NOTIFICATION_JOB_WELCOME_EMAIL) {
      await this.mailService.sendWelcomeEmail(jobData.to, jobData.fullName);
      return;
    }

    if (jobData.type === NOTIFICATION_JOB_VERIFY_EMAIL) {
      await this.mailService.sendVerifyEmail(
        jobData.to,
        jobData.fullName,
        jobData.verifyUrl,
      );
    }
  }

  private buildQueueConnection(redisUrl: string) {
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

  private resolveRedisUrl() {
    const direct = this.configService.get<string>('REDIS_URL')?.trim();
    if (direct) {
      return direct;
    }

    const upstashRestUrl = this.configService
      .get<string>('UPSTASH_REDIS_REST_URL')
      ?.trim();
    const upstashToken = this.configService
      .get<string>('UPSTASH_REDIS_REST_TOKEN')
      ?.trim();

    if (!upstashRestUrl || !upstashToken) {
      return undefined;
    }

    const host = new URL(upstashRestUrl).host;
    return `rediss://default:${upstashToken}@${host}:6379`;
  }
}
