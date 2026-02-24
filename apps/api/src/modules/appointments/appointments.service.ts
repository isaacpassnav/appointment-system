import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { IdempotencyCacheService } from './idempotency-cache.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idempotencyCache: IdempotencyCacheService,
  ) {}

  async create(
    userId: string,
    dto: CreateAppointmentDto,
    idempotencyKey?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
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
      ? this.buildCacheKey(userId, safeIdempotencyKey)
      : null;

    if (cacheKey) {
      const cachedAppointmentId = this.idempotencyCache.find(cacheKey);
      if (cachedAppointmentId) {
        return this.findOne(userId, cachedAppointmentId);
      }
    }

    const endsAt = new Date(startsAt.getTime() + dto.durationMinutes * 60_000);

    const conflict = await this.prisma.appointment.findFirst({
      where: {
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
        userId,
        startsAt,
        endsAt,
        notes: dto.notes?.trim(),
      },
    });

    if (cacheKey) {
      this.idempotencyCache.save(cacheKey, appointment.id);
    }

    return appointment;
  }

  findAll(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId },
      orderBy: { startsAt: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }
    if (appointment.userId !== userId) {
      throw new NotFoundException('Appointment not found.');
    }

    return appointment;
  }

  async cancel(userId: string, id: string) {
    await this.findOne(userId, id);

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

  private buildCacheKey(userId: string, idempotencyKey: string): string {
    return `${userId}:${idempotencyKey}`;
  }
}
