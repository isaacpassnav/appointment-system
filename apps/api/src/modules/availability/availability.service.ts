import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateWorkingHoursDto,
  UpdateWorkingHoursDto,
  CreateExceptionDateDto,
  AvailableSlotsQueryDto,
  AvailableSlotsResponseDto,
  AvailableSlotDto,
  WorkingHoursResponseDto,
  ExceptionDateResponseDto,
} from './dto';
import { WorkingHours, ExceptionDate, Prisma } from '@prisma/client';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== Working Hours ====================

  async createWorkingHours(
    tenantId: string,
    dto: CreateWorkingHoursDto,
  ): Promise<WorkingHoursResponseDto> {
    // Validar que endTime sea mayor que startTime
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const data: Prisma.WorkingHoursCreateInput = {
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      isActive: dto.isActive ?? true,
      tenant: { connect: { id: tenantId } },
    };

    const created = await this.prisma.workingHours.create({ data });
    return this.mapWorkingHoursToDto(created);
  }

  async getWorkingHours(tenantId: string): Promise<WorkingHoursResponseDto[]> {
    const hours = await this.prisma.workingHours.findMany({
      where: { tenantId },
      orderBy: { dayOfWeek: 'asc' },
    });
    return hours.map((h) => this.mapWorkingHoursToDto(h));
  }

  async updateWorkingHours(
    tenantId: string,
    dayOfWeek: number,
    dto: UpdateWorkingHoursDto,
  ): Promise<WorkingHoursResponseDto> {
    const existing = await this.prisma.workingHours.findUnique({
      where: { tenantId_dayOfWeek: { tenantId, dayOfWeek } },
    });

    if (!existing) {
      throw new NotFoundException(
        `Working hours for day ${dayOfWeek} not found`,
      );
    }

    // Validar tiempos si ambos se proporcionan
    if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const data: Prisma.WorkingHoursUpdateInput = {};
    if (dto.startTime !== undefined) data.startTime = dto.startTime;
    if (dto.endTime !== undefined) data.endTime = dto.endTime;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const updated = await this.prisma.workingHours.update({
      where: { tenantId_dayOfWeek: { tenantId, dayOfWeek } },
      data,
    });

    return this.mapWorkingHoursToDto(updated);
  }

  async deleteWorkingHours(tenantId: string, dayOfWeek: number): Promise<void> {
    const existing = await this.prisma.workingHours.findUnique({
      where: { tenantId_dayOfWeek: { tenantId, dayOfWeek } },
    });

    if (!existing) {
      throw new NotFoundException(
        `Working hours for day ${dayOfWeek} not found`,
      );
    }

    await this.prisma.workingHours.delete({
      where: { tenantId_dayOfWeek: { tenantId, dayOfWeek } },
    });
  }

  // ==================== Exception Dates ====================

  async createExceptionDate(
    tenantId: string,
    dto: CreateExceptionDateDto,
  ): Promise<ExceptionDateResponseDto> {
    const date = new Date(dto.date);
    date.setUTCHours(0, 0, 0, 0);

    // Validar que si no está bloqueado, tenga horarios
    if (!dto.isBlocked && (!dto.startTime || !dto.endTime)) {
      throw new BadRequestException(
        'startTime and endTime are required when isBlocked is false',
      );
    }

    // Validar que endTime > startTime si no está bloqueado
    if (!dto.isBlocked && dto.startTime && dto.endTime) {
      if (dto.startTime >= dto.endTime) {
        throw new BadRequestException('endTime must be after startTime');
      }
    }

    const data: Prisma.ExceptionDateCreateInput = {
      date,
      reason: dto.reason,
      isBlocked: dto.isBlocked,
      startTime: dto.isBlocked ? null : dto.startTime ?? null,
      endTime: dto.isBlocked ? null : dto.endTime ?? null,
      tenant: { connect: { id: tenantId } },
    };

    try {
      const created = await this.prisma.exceptionDate.create({ data });
      return this.mapExceptionDateToDto(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `Exception date already exists for ${dto.date}`,
          );
        }
      }
      throw error;
    }
  }

  async getExceptionDates(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ExceptionDateResponseDto[]> {
    const where: Prisma.ExceptionDateWhereInput = { tenantId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const exceptions = await this.prisma.exceptionDate.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return exceptions.map((e) => this.mapExceptionDateToDto(e));
  }

  async deleteExceptionDate(tenantId: string, id: string): Promise<void> {
    const existing = await this.prisma.exceptionDate.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Exception date with id ${id} not found`);
    }

    await this.prisma.exceptionDate.delete({ where: { id } });
  }

  // ==================== Available Slots ====================

  async getAvailableSlots(
    tenantId: string,
    query: AvailableSlotsQueryDto,
  ): Promise<AvailableSlotsResponseDto> {
    const date = new Date(query.date);
    const dayOfWeek = date.getUTCDay(); // 0=Sunday, 6=Saturday

    // Obtener duración del servicio o usar la proporcionada
    let durationMinutes = query.durationMinutes || 30;
    if (query.serviceId) {
      const service = await this.prisma.service.findFirst({
        where: { id: query.serviceId, tenantId },
      });
      if (service) {
        durationMinutes = service.duration;
      }
    }

    // Verificar si hay una excepción para esta fecha
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const exception = await this.prisma.exceptionDate.findFirst({
      where: {
        tenantId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Si está completamente bloqueado
    if (exception?.isBlocked) {
      return {
        date: query.date,
        dayOfWeek,
        isBlocked: true,
        exceptionReason: exception.reason,
        slots: [],
      };
    }

    // Obtener horario de atención para este día
    let workingHours = await this.prisma.workingHours.findUnique({
      where: { tenantId_dayOfWeek: { tenantId, dayOfWeek } },
    });

    // Si no hay configuración o está inactivo, usar defaults
    if (!workingHours || !workingHours.isActive) {
      workingHours = {
        id: '',
        tenantId,
        dayOfWeek,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Si hay excepción con horario especial
    let startTime = workingHours.startTime;
    let endTime = workingHours.endTime;
    if (exception && !exception.isBlocked) {
      startTime = exception.startTime ?? startTime;
      endTime = exception.endTime ?? endTime;
    }

    // Obtener citas existentes para este día
    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        startsAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      orderBy: { startsAt: 'asc' },
    });

    // Generar slots
    const slots = this.generateSlots(
      startTime,
      endTime,
      durationMinutes,
      existingAppointments,
      date,
    );

    return {
      date: query.date,
      dayOfWeek,
      isBlocked: false,
      exceptionReason: exception?.reason ?? null,
      slots,
    };
  }

  // ==================== Helpers ====================

  private generateSlots(
    startTime: string,
    endTime: string,
    durationMinutes: number,
    existingAppointments: Array<{ startsAt: Date; endsAt: Date }>,
    baseDate: Date,
  ): AvailableSlotDto[] {
    const slots: AvailableSlotDto[] = [];

    // Parsear horarios
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    const endTotalMinutes = endHour * 60 + endMin;

    while (currentHour * 60 + currentMin + durationMinutes <= endTotalMinutes) {
      const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      const slotEndTotal = currentHour * 60 + currentMin + durationMinutes;
      const slotEndHour = Math.floor(slotEndTotal / 60);
      const slotEndMin = slotEndTotal % 60;
      const slotEnd = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;

      // Verificar si hay conflicto con citas existentes
      const slotStartDate = new Date(baseDate);
      slotStartDate.setUTCHours(currentHour, currentMin, 0, 0);
      const slotEndDate = new Date(baseDate);
      slotEndDate.setUTCHours(slotEndHour, slotEndMin, 0, 0);

      const hasConflict = existingAppointments.some((appt) => {
        return (
          slotStartDate < appt.endsAt &&
          slotEndDate > appt.startsAt
        );
      });

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        available: !hasConflict,
      });

      // Avanzar al siguiente slot (cada 30 min)
      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }

    return slots;
  }

  private mapWorkingHoursToDto(hours: WorkingHours): WorkingHoursResponseDto {
    return {
      id: hours.id,
      tenantId: hours.tenantId,
      dayOfWeek: hours.dayOfWeek,
      startTime: hours.startTime,
      endTime: hours.endTime,
      isActive: hours.isActive,
      createdAt: hours.createdAt,
      updatedAt: hours.updatedAt,
    };
  }

  private mapExceptionDateToDto(
    exception: ExceptionDate,
  ): ExceptionDateResponseDto {
    return {
      id: exception.id,
      tenantId: exception.tenantId,
      date: exception.date,
      reason: exception.reason,
      isBlocked: exception.isBlocked,
      startTime: exception.startTime,
      endTime: exception.endTime,
      createdAt: exception.createdAt,
      updatedAt: exception.updatedAt,
    };
  }

  // ==================== Batch Operations ====================

  async setWorkingHoursBatch(
    tenantId: string,
    hours: CreateWorkingHoursDto[],
  ): Promise<WorkingHoursResponseDto[]> {
    // Eliminar horarios existentes
    await this.prisma.workingHours.deleteMany({
      where: { tenantId },
    });

    // Crear nuevos horarios
    const results: WorkingHoursResponseDto[] = [];
    for (const dto of hours) {
      const created = await this.createWorkingHours(tenantId, dto);
      results.push(created);
    }

    return results;
  }
}
