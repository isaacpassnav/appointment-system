import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { IdempotencyCacheService } from './idempotency-cache.service';
import { AvailabilityModule } from '../availability/availability.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    NotificationsModule,
    PrismaModule,
    AvailabilityModule,
    ClientsModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, IdempotencyCacheService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
