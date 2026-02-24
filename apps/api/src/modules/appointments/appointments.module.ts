import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { IdempotencyCacheService } from './idempotency-cache.service';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService, IdempotencyCacheService],
})
export class AppointmentsModule {}
