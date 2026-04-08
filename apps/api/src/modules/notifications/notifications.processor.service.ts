import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationStatus } from '@prisma/client';
import { Job, Queue, Worker } from 'bullmq';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { NotificationJobData } from './notification-job.types';
import {
  NOTIFICATION_JOB_APPOINTMENT_CONFIRMATION_EMAIL,
  NOTIFICATION_JOB_APPOINTMENT_REMINDER_EMAIL,
  NOTIFICATION_JOB_VERIFY_EMAIL,
  NOTIFICATION_JOB_WELCOME_EMAIL,
  NOTIFICATIONS_DEAD_LETTER_QUEUE_NAME,
  NOTIFICATIONS_QUEUE_NAME,
} from './notifications.constants';

type NotificationDeadLetterPayload = {
  queue: typeof NOTIFICATIONS_QUEUE_NAME;
  jobId: string;
  jobName: string;
  attemptsMade: number;
  maxAttempts: number;
  failedAt: string;
  reason: string;
  data: NotificationJobData;
};

@Injectable()
export class NotificationsProcessorService implements OnModuleDestroy {
  private readonly logger = new Logger(NotificationsProcessorService.name);
  private readonly worker: Worker<NotificationJobData> | null;
  private readonly deadLetterQueue: Queue<NotificationDeadLetterPayload> | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {
    if (!this.isInlineProcessorEnabled()) {
      this.logger.log(
        'Inline notifications processor disabled (NOTIFICATIONS_INLINE_PROCESSOR_ENABLED=false).',
      );
      this.worker = null;
      this.deadLetterQueue = null;
      return;
    }

    const redisUrl = this.resolveRedisUrl();
    if (!redisUrl) {
      this.logger.warn(
        'Inline notifications processor skipped. Missing REDIS_URL (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).',
      );
      this.worker = null;
      this.deadLetterQueue = null;
      return;
    }

    const concurrency = this.resolveConcurrency();
    const connection = this.buildQueueConnection(redisUrl);

    this.worker = new Worker<NotificationJobData>(
      NOTIFICATIONS_QUEUE_NAME,
      async (job) => this.process(job),
      {
        connection,
        concurrency,
      },
    );

    this.deadLetterQueue = new Queue<NotificationDeadLetterPayload>(
      NOTIFICATIONS_DEAD_LETTER_QUEUE_NAME,
      {
        connection,
        defaultJobOptions: {
          removeOnComplete: 1_000,
          removeOnFail: false,
        },
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
    await Promise.allSettled([
      this.worker?.close(),
      this.deadLetterQueue?.close(),
    ]);
  }

  private async process(job: Job<NotificationJobData>) {
    const data = job.data;

    try {
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
        await this.markNotificationSent(data.notificationLogId);
        return;
      }

      if (data.type === NOTIFICATION_JOB_APPOINTMENT_REMINDER_EMAIL) {
        await this.mailService.sendAppointmentReminderEmail(
          data.to,
          data.fullName,
          data.startsAtIso,
          data.reminderOffsetHours,
        );
        await this.markNotificationSent(data.notificationLogId);
        return;
      }

      throw new Error(`Unsupported notification job: ${job.name}`);
    } catch (error: unknown) {
      const isFinalFailure = this.isFinalFailure(job);
      if (isFinalFailure && this.isAppointmentNotification(data)) {
        const message = error instanceof Error ? error.message : String(error);
        await this.markNotificationFailed(data.notificationLogId, message);
      }

      if (isFinalFailure) {
        await this.enqueueDeadLetter(job, error);
      }

      throw error;
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

  private async markNotificationSent(notificationLogId: string) {
    await this.prisma.notificationLog.update({
      where: { id: notificationLogId },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        errorMessage: null,
      },
    });
  }

  private async markNotificationFailed(
    notificationLogId: string,
    errorMessage: string,
  ) {
    await this.prisma.notificationLog.update({
      where: { id: notificationLogId },
      data: {
        status: NotificationStatus.FAILED,
        errorMessage: errorMessage.slice(0, 900),
      },
    });
  }

  private isAppointmentNotification(data: NotificationJobData): data is Extract<
    NotificationJobData,
    {
      type:
        | typeof NOTIFICATION_JOB_APPOINTMENT_CONFIRMATION_EMAIL
        | typeof NOTIFICATION_JOB_APPOINTMENT_REMINDER_EMAIL;
    }
  > {
    return (
      data.type === NOTIFICATION_JOB_APPOINTMENT_CONFIRMATION_EMAIL ||
      data.type === NOTIFICATION_JOB_APPOINTMENT_REMINDER_EMAIL
    );
  }

  private isFinalFailure(job: Job<NotificationJobData>) {
    const maxAttempts =
      typeof job.opts.attempts === 'number' && job.opts.attempts > 0
        ? job.opts.attempts
        : 1;

    return job.attemptsMade + 1 >= maxAttempts;
  }

  private async enqueueDeadLetter(
    job: Job<NotificationJobData>,
    error: unknown,
  ) {
    if (!this.deadLetterQueue) {
      return;
    }

    const reason = error instanceof Error ? error.message : String(error);
    const maxAttempts =
      typeof job.opts.attempts === 'number' && job.opts.attempts > 0
        ? job.opts.attempts
        : 1;

    await this.deadLetterQueue.add('notification-dead-letter', {
      queue: NOTIFICATIONS_QUEUE_NAME,
      jobId: String(job.id ?? 'unknown'),
      jobName: job.name,
      attemptsMade: job.attemptsMade + 1,
      maxAttempts,
      failedAt: new Date().toISOString(),
      reason: reason.slice(0, 900),
      data: job.data,
    });
  }
}
