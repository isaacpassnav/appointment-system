import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { IdempotencyCacheService } from './idempotency-cache.service';

const appointmentListSelect = {
  id: true,
  tenantId: true,
  userId: true,
  startsAt: true,
  endsAt: true,
  status: true,
  notes: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
} as const;

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idempotencyCache: IdempotencyCacheService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    userId: string,
    tenantId: string,
    dto: CreateAppointmentDto,
    idempotencyKey?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const startsAt = new Date(dto.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException('Invalid startsAt format.');
    }

    const safeIdempotencyKey = this.normalizeIdempotencyKey(idempotencyKey);
    const cacheKey = safeIdempotencyKey
      ? this.buildCacheKey(tenantId, userId, safeIdempotencyKey)
      : null;

    if (cacheKey) {
      const cachedAppointmentId = this.idempotencyCache.find(cacheKey);
      if (cachedAppointmentId) {
        return this.findOne(userId, tenantId, cachedAppointmentId);
      }
    }

    const endsAt = new Date(startsAt.getTime() + dto.durationMinutes * 60_000);

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        tenantId,
        userId,
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: { id: true },
    });

    if (conflict) {
      throw new ConflictException('Appointment overlaps with an existing one.');
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId,
        userId,
        startsAt,
        endsAt,
        notes: dto.notes?.trim(),
      },
    });

    if (cacheKey) {
      this.idempotencyCache.save(cacheKey, appointment.id);
    }

    this.scheduleAppointmentNotifications({
      tenantId,
      appointmentId: appointment.id,
      email: user.email,
      fullName: user.fullName,
      startsAtIso: startsAt.toISOString(),
    });

    return appointment;
  }

  findAll(userId: string, tenantId: string) {
    return this.prisma.appointment.findMany({
      where: { userId, tenantId },
      orderBy: { startsAt: 'asc' },
      select: appointmentListSelect,
    });
  }

  async findOne(userId: string, tenantId: string, id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      select: appointmentListSelect,
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }
    if (appointment.userId !== userId || appointment.tenantId !== tenantId) {
      throw new NotFoundException('Appointment not found.');
    }

    return appointment;
  }

  async cancel(userId: string, tenantId: string, id: string) {
    await this.findOne(userId, tenantId, id);

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  }

  private normalizeIdempotencyKey(rawKey?: string): string | null {
    if (!rawKey) {
      return null;
    }

    const normalized = rawKey.trim();
    if (!normalized) {
      return null;
    }

    if (normalized.length > 120) {
      throw new BadRequestException(
        'x-idempotency-key must be at most 120 characters.',
      );
    }

    return normalized;
  }

  private buildCacheKey(
    tenantId: string,
    userId: string,
    idempotencyKey: string,
  ): string {
    return `${tenantId}:${userId}:${idempotencyKey}`;
  }

  private scheduleAppointmentNotifications(params: {
    tenantId: string;
    appointmentId: string;
    email: string;
    fullName: string;
    startsAtIso: string;
  }) {
    const startsAtMs = new Date(params.startsAtIso).getTime();
    if (Number.isNaN(startsAtMs)) {
      return;
    }

    const now = Date.now();
    const reminder24DelayMs = startsAtMs - now - 24 * 60 * 60 * 1000;
    const reminder1DelayMs = startsAtMs - now - 60 * 60 * 1000;

    const tasks: Promise<void>[] = [
      this.notificationsService.enqueueAppointmentConfirmationEmail({
        tenantId: params.tenantId,
        appointmentId: params.appointmentId,
        to: params.email,
        fullName: params.fullName,
        startsAtIso: params.startsAtIso,
      }),
    ];

    if (reminder24DelayMs > 0) {
      tasks.push(
        this.notificationsService.enqueueAppointmentReminderEmail({
          tenantId: params.tenantId,
          appointmentId: params.appointmentId,
          to: params.email,
          fullName: params.fullName,
          startsAtIso: params.startsAtIso,
          reminderOffsetHours: 24,
          delayMs: reminder24DelayMs,
        }),
      );
    }

    if (reminder1DelayMs > 0) {
      tasks.push(
        this.notificationsService.enqueueAppointmentReminderEmail({
          tenantId: params.tenantId,
          appointmentId: params.appointmentId,
          to: params.email,
          fullName: params.fullName,
          startsAtIso: params.startsAtIso,
          reminderOffsetHours: 1,
          delayMs: reminder1DelayMs,
        }),
      );
    }

    void Promise.allSettled(tasks).then((results) => {
      for (const result of results) {
        if (result.status === 'rejected') {
          const message =
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason);
          this.logger.error(
            `Failed to enqueue appointment email job: ${message}`,
          );
        }
      }
    });
  }
}
