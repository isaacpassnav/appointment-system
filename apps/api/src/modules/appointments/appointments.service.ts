import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateAppointmentDto) {
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

    return this.prisma.appointment.create({
      data: {
        userId,
        startsAt,
        endsAt,
        notes: dto.notes?.trim(),
      },
    });
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
}
