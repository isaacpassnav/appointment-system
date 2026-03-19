import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { NotificationsProcessorService } from './notifications.processor.service';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [MailModule],
  providers: [NotificationsService, NotificationsProcessorService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
