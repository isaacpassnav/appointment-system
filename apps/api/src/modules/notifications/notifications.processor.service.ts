import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';
import { MailService } from '../mail/mail.service';
import type { NotificationJobData } from './notification-job.types';
import {
  NOTIFICATION_JOB_APPOINTMENT_CONFIRMATION_EMAIL,
  NOTIFICATION_JOB_APPOINTMENT_REMINDER_EMAIL,
  NOTIFICATION_JOB_VERIFY_EMAIL,
  NOTIFICATION_JOB_WELCOME_EMAIL,
  NOTIFICATIONS_QUEUE_NAME,
} from './notifications.constants';

@Injectable()
export class NotificationsProcessorService implements OnModuleDestroy {
  private readonly logger = new Logger(NotificationsProcessorService.name);
  private readonly worker: Worker<NotificationJobData> | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    if (!this.isInlineProcessorEnabled()) {
      this.logger.log(
        'Inline notifications processor disabled (NOTIFICATIONS_INLINE_PROCESSOR_ENABLED=false).',
      );
      this.worker = null;
      return;
    }

    const redisUrl = this.resolveRedisUrl();
    if (!redisUrl) {
      this.logger.warn(
        'Inline notifications processor skipped. Missing REDIS_URL (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).',
      );
      this.worker = null;
      return;
    }

    const concurrency = this.resolveConcurrency();

    this.worker = new Worker<NotificationJobData>(
      NOTIFICATIONS_QUEUE_NAME,
      async (job) => this.process(job.name, job.data),
      {
        connection: this.buildQueueConnection(redisUrl),
        concurrency,
      },
    );

    this.worker.on('ready', () => {
      this.logger.log(
        `Inline notifications processor ready on ${new URL(redisUrl).host} (concurrency=${concurrency}).`,
      );
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error(
        `Notification job failed (${job?.name ?? 'unknown'} / ${job?.id ?? 'no-id'}): ${error.message}`,
      );
    });
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  private async process(jobName: string, data: NotificationJobData) {
    if (data.type === NOTIFICATION_JOB_WELCOME_EMAIL) {
      await this.mailService.sendWelcomeEmail(data.to, data.fullName);
      return;
    }

    if (data.type === NOTIFICATION_JOB_VERIFY_EMAIL) {
      await this.mailService.sendVerifyEmail(
        data.to,
        data.fullName,
        data.verifyUrl,
      );
      return;
    }

    if (data.type === NOTIFICATION_JOB_APPOINTMENT_CONFIRMATION_EMAIL) {
      await this.mailService.sendAppointmentConfirmationEmail(
        data.to,
        data.fullName,
        data.startsAtIso,
      );
      return;
    }

    if (data.type === NOTIFICATION_JOB_APPOINTMENT_REMINDER_EMAIL) {
      await this.mailService.sendAppointmentReminderEmail(
        data.to,
        data.fullName,
        data.startsAtIso,
        data.reminderOffsetHours,
      );
      return;
    }

    throw new Error(`Unsupported notification job: ${jobName}`);
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

  private resolveConcurrency() {
    const rawValue = this.configService
      .get<string>('WORKER_CONCURRENCY')
      ?.trim();
    const parsed = Number(rawValue);

    if (!rawValue || !Number.isFinite(parsed) || parsed <= 0) {
      return 5;
    }

    return Math.floor(parsed);
  }

  private isInlineProcessorEnabled() {
    const rawValue = this.configService
      .get<string>('NOTIFICATIONS_INLINE_PROCESSOR_ENABLED')
      ?.trim()
      .toLowerCase();

    if (!rawValue) {
      return true;
    }

    return !['0', 'false', 'no', 'off'].includes(rawValue);
  }
}
