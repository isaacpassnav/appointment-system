import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from './dto/create-appointment.dto';
import { IdempotencyCacheService } from './idempotency-cache.service';
import { AvailabilityService } from '../availability/availability.service';
import { ClientsService } from '../clients/clients.service';

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
  service: {
    select: {
      id: true,
      name: true,
      duration: true,
      price: true,
      color: true,
    },
  },
  client: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
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
    private readonly availabilityService: AvailabilityService,
    private readonly clientsService: ClientsService,
  ) {}

  async create(
    userId: string,
    tenantId: string,
    dto: CreateAppointmentDto,
    idempotencyKey?: string,
  ) {
    // Validar usuario
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

    // Idempotencia
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

    // Determinar duración (del servicio o del DTO)
    let durationMinutes = dto.durationMinutes || 30;

    if (dto.serviceId) {
      const service = await this.prisma.service.findFirst({
        where: { id: dto.serviceId, tenantId, isActive: true },
      });
      if (!service) {
        throw new NotFoundException('Service not found or inactive.');
      }
      // Usar duración del servicio si no se especificó una
      if (!dto.durationMinutes) {
        durationMinutes = service.duration;
      }
    }

    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);

    // Validar disponibilidad usando el módulo de availability
    const dateStr = startsAt.toISOString().split('T')[0];
    const availability = await this.availabilityService.getAvailableSlots(
      tenantId,
      { date: dateStr, durationMinutes },
    );

    if (availability.isBlocked) {
      throw new ConflictException(
        `This date is not available for booking${availability.exceptionReason ? `: ${availability.exceptionReason}` : '.'}`,
      );
    }

    // Verificar que el slot esté disponible
    const startTimeStr = startsAt.toISOString().slice(11, 16); // HH:mm
    const matchingSlot = availability.slots.find(
      (s) => s.startTime === startTimeStr && s.available,
    );

    if (!matchingSlot) {
      throw new ConflictException(
        'The selected time slot is not available. Please choose another time.',
      );
    }

    // Validar cliente si se proporciona
    if (dto.clientId) {
      const client = await this.clientsService.findOne(tenantId, dto.clientId);
      if (!client) {
        throw new NotFoundException('Client not found.');
      }
    }

    // Verificar conflictos con otras citas
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        tenantId,
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

    // Crear la cita
    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId,
        userId,
        clientId: dto.clientId || null,
        serviceId: dto.serviceId || null,
        startsAt,
        endsAt,
        notes: dto.notes?.trim(),
      },
      include: {
        service: {
          select: { id: true, name: true, duration: true, price: true },
        },
        client: {
          select: { id: true, name: true, email: true, phone: true },
        },
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

  async update(
    userId: string,
    tenantId: string,
    id: string,
    dto: UpdateAppointmentDto,
  ) {
    const existing = await this.findOne(userId, tenantId, id);

    if (existing.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled appointment.');
    }

    let startsAt = existing.startsAt;
    let endsAt = existing.endsAt;
    let durationMinutes =
      (existing.endsAt.getTime() - existing.startsAt.getTime()) / 60_000;

    // Si se actualiza el servicio
    if (dto.serviceId !== undefined) {
      if (dto.serviceId) {
        const service = await this.prisma.service.findFirst({
          where: { id: dto.serviceId, tenantId, isActive: true },
        });
        if (!service) {
          throw new NotFoundException('Service not found or inactive.');
        }
        durationMinutes = service.duration;
      } else {
        // Si se quita el servicio, mantener duración actual
      }
    }

    // Si se actualiza la fecha/hora
    if (dto.startsAt) {
      startsAt = new Date(dto.startsAt);
      if (Number.isNaN(startsAt.getTime())) {
        throw new BadRequestException('Invalid startsAt format.');
      }

      // Recalcular endsAt
      endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);

      // Validar disponibilidad
      const dateStr = startsAt.toISOString().split('T')[0];
      const availability = await this.availabilityService.getAvailableSlots(
        tenantId,
        { date: dateStr, durationMinutes },
      );

      if (availability.isBlocked) {
        throw new ConflictException(
          `This date is not available for booking${availability.exceptionReason ? `: ${availability.exceptionReason}` : '.'}`,
        );
      }

      const startTimeStr = startsAt.toISOString().slice(11, 16);
      const matchingSlot = availability.slots.find(
        (s) => s.startTime === startTimeStr && s.available,
      );

      if (!matchingSlot) {
        throw new ConflictException('The selected time slot is not available.');
      }

      // Verificar que no haya conflictos (excluyendo esta cita)
      const conflict = await this.prisma.appointment.findFirst({
        where: {
          tenantId,
          id: { not: id },
          status: {
            in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
          },
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
        },
        select: { id: true },
      });

      if (conflict) {
        throw new ConflictException(
          'Appointment overlaps with an existing one.',
        );
      }
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        startsAt,
        endsAt,
        serviceId: dto.serviceId !== undefined ? dto.serviceId : undefined,
        notes: dto.notes !== undefined ? dto.notes?.trim() : undefined,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
            color: true,
          },
        },
        client: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    return updated;
  }

  async cancel(userId: string, tenantId: string, id: string) {
    const appointment = await this.findOne(userId, tenantId, id);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled.');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: {
        service: {
          select: { id: true, name: true },
        },
        client: {
          select: { id: true, name: true },
        },
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
