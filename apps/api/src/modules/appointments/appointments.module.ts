import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { IdempotencyCacheService } from './idempotency-cache.service';

@Module({
  imports: [NotificationsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, IdempotencyCacheService],
})
export class AppointmentsModule {}
