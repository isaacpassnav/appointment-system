import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';
import type { NotificationJobData } from './notification-job.types';
import {
  NOTIFICATION_JOB_VERIFY_EMAIL,
  NOTIFICATION_JOB_WELCOME_EMAIL,
  NOTIFICATIONS_QUEUE_NAME,
} from './notifications.constants';

@Processor(NOTIFICATIONS_QUEUE_NAME)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<NotificationJobData>) {
    const data = job.data;
    this.logger.log(`Processing job ${job.name} (${job.id ?? 'no-id'})`);

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

    throw new Error(`Unsupported notification job: ${job.name}`);
  }
}
