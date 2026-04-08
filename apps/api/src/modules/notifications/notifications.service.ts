import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { NotificationJobData } from './notification-job.types';
import {
  NOTIFICATION_JOB_APPOINTMENT_CONFIRMATION_EMAIL,
  NOTIFICATION_JOB_APPOINTMENT_REMINDER_EMAIL,
  NOTIFICATION_JOB_VERIFY_EMAIL,
  NOTIFICATION_JOB_WELCOME_EMAIL,
  NOTIFICATIONS_QUEUE_NAME,
} from './notifications.constants';

type EnqueueOptions = {
  delayMs?: number;
};

const APPOINTMENT_CONFIRMATION_TEMPLATE = 'appointment-confirmation-email';
const APPOINTMENT_REMINDER_TEMPLATE_24H = 'appointment-reminder-24h-email';
const APPOINTMENT_REMINDER_TEMPLATE_1H = 'appointment-reminder-1h-email';

@Injectable()
export class NotificationsService implements OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly queue: Queue | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
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
        attempts: this.resolveMaxAttempts(),
        backoff: {
          type: 'exponential',
          delay: this.resolveBackoffDelayMs(),
        },
        removeOnComplete: 200,
        removeOnFail: false,
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

  async enqueueAppointmentConfirmationEmail(params: {
    tenantId: string;
    appointmentId: string;
    to: string;
    fullName: string;
    startsAtIso: string;
  }) {
    const notificationLog = await this.createNotificationLog({
      tenantId: params.tenantId,
      appointmentId: params.appointmentId,
      template: APPOINTMENT_CONFIRMATION_TEMPLATE,
    });

    await this.enqueueOrFallback({
      type: NOTIFICATION_JOB_APPOINTMENT_CONFIRMATION_EMAIL,
      tenantId: params.tenantId,
      appointmentId: params.appointmentId,
      notificationLogId: notificationLog.id,
      to: params.to,
      fullName: params.fullName,
      startsAtIso: params.startsAtIso,
    });
  }

  async enqueueAppointmentReminderEmail(params: {
    tenantId: string;
    appointmentId: string;
    to: string;
    fullName: string;
    startsAtIso: string;
    reminderOffsetHours: 24 | 1;
    delayMs: number;
  }) {
    const notificationLog = await this.createNotificationLog({
      tenantId: params.tenantId,
      appointmentId: params.appointmentId,
      template:
        params.reminderOffsetHours === 24
          ? APPOINTMENT_REMINDER_TEMPLATE_24H
          : APPOINTMENT_REMINDER_TEMPLATE_1H,
    });

    await this.enqueueOrFallback(
      {
        type: NOTIFICATION_JOB_APPOINTMENT_REMINDER_EMAIL,
        tenantId: params.tenantId,
        appointmentId: params.appointmentId,
        notificationLogId: notificationLog.id,
        to: params.to,
        fullName: params.fullName,
        startsAtIso: params.startsAtIso,
        reminderOffsetHours: params.reminderOffsetHours,
      },
      {
        delayMs: params.delayMs,
      },
    );
  }

  async getTenantDeliveryMetrics(tenantId: string, days: number) {
    const windowStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const logs = await this.prisma.notificationLog.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: windowStart,
        },
      },
      select: {
        status: true,
        template: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totals = {
      queued: 0,
      sent: 0,
      failed: 0,
    };

    const byTemplate = new Map<
      string,
      { queued: number; sent: number; failed: number }
    >();

    for (const log of logs) {
      if (log.status === NotificationStatus.QUEUED) {
        totals.queued += 1;
      } else if (log.status === NotificationStatus.SENT) {
        totals.sent += 1;
      } else if (log.status === NotificationStatus.FAILED) {
        totals.failed += 1;
      }

      const existing = byTemplate.get(log.template) ?? {
        queued: 0,
        sent: 0,
        failed: 0,
      };

      if (log.status === NotificationStatus.QUEUED) {
        existing.queued += 1;
      } else if (log.status === NotificationStatus.SENT) {
        existing.sent += 1;
      } else if (log.status === NotificationStatus.FAILED) {
        existing.failed += 1;
      }

      byTemplate.set(log.template, existing);
    }

    const processed = totals.sent + totals.failed;
    const sentRate =
      processed > 0 ? Math.round((totals.sent / processed) * 100) : 0;

    return {
      window: {
        days,
        from: windowStart.toISOString(),
        to: new Date().toISOString(),
      },
      totals: {
        ...totals,
        processed,
        sentRate,
      },
      byTemplate: Array.from(byTemplate.entries()).map(([template, stats]) => ({
        template,
        ...stats,
      })),
    };
  }

  async onModuleDestroy() {
    await Promise.allSettled([this.queue?.close()]);
  }

  private async enqueueOrFallback(
    jobData: NotificationJobData,
    options?: EnqueueOptions,
  ) {
    const notificationLogId = this.extractNotificationLogId(jobData);

    if (this.queue) {
      try {
        await this.queue.add(jobData.type, jobData, {
          delay: options?.delayMs,
        });
        return;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Queue enqueue failed for ${jobData.type}. Falling back to direct email send. Reason: ${message}`,
        );
      }
    }

    if ((options?.delayMs ?? 0) > 0) {
      this.logger.warn(
        `Skipping delayed notification without queue support: ${jobData.type}.`,
      );
      if (notificationLogId) {
        await this.markNotificationFailed(
          notificationLogId,
          'Queue unavailable for delayed notification.',
        );
      }
      return;
    }

    // Fallback keeps delivery working even when Redis is missing or temporarily unreachable.
    try {
      await this.sendEmailDirectly(jobData);
    } catch (error: unknown) {
      if (notificationLogId) {
        const message = error instanceof Error ? error.message : String(error);
        await this.markNotificationFailed(notificationLogId, message);
      }
      throw error;
    }
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
      return;
    }

    if (jobData.type === NOTIFICATION_JOB_APPOINTMENT_CONFIRMATION_EMAIL) {
      await this.mailService.sendAppointmentConfirmationEmail(
        jobData.to,
        jobData.fullName,
        jobData.startsAtIso,
      );
      await this.markNotificationSent(jobData.notificationLogId);
      return;
    }

    if (jobData.type === NOTIFICATION_JOB_APPOINTMENT_REMINDER_EMAIL) {
      await this.mailService.sendAppointmentReminderEmail(
        jobData.to,
        jobData.fullName,
        jobData.startsAtIso,
        jobData.reminderOffsetHours,
      );
      await this.markNotificationSent(jobData.notificationLogId);
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

  private resolveMaxAttempts() {
    const raw = this.configService
      .get<string>('NOTIFICATIONS_MAX_ATTEMPTS')
      ?.trim();
    const parsed = Number(raw);

    if (!raw || !Number.isFinite(parsed) || parsed <= 0) {
      return 5;
    }

    return Math.floor(parsed);
  }

  private resolveBackoffDelayMs() {
    const raw = this.configService
      .get<string>('NOTIFICATIONS_BACKOFF_MS')
      ?.trim();
    const parsed = Number(raw);

    if (!raw || !Number.isFinite(parsed) || parsed <= 0) {
      return 2_000;
    }

    return Math.floor(parsed);
  }

  private extractNotificationLogId(jobData: NotificationJobData) {
    if (
      jobData.type === NOTIFICATION_JOB_APPOINTMENT_CONFIRMATION_EMAIL ||
      jobData.type === NOTIFICATION_JOB_APPOINTMENT_REMINDER_EMAIL
    ) {
      return jobData.notificationLogId;
    }

    return undefined;
  }

  private async createNotificationLog(params: {
    tenantId: string;
    appointmentId: string;
    template: string;
  }) {
    return this.prisma.notificationLog.create({
      data: {
        tenantId: params.tenantId,
        appointmentId: params.appointmentId,
        channel: NotificationChannel.EMAIL,
        status: NotificationStatus.QUEUED,
        template: params.template,
      },
      select: { id: true },
    });
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
}
