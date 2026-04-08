import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';
import {
  AnalyticsQueryDto,
  AnalyticsPeriod,
  DashboardMetricsDto,
  AnalyticsReportDto,
  TimeSeriesDataPointDto,
} from './dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(
    tenantId: string,
    query: AnalyticsQueryDto,
  ): Promise<DashboardMetricsDto> {
    const { startDate, endDate } = this.getDateRange(query);

    // Obtener citas en el período
    const appointments = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        startsAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        service: {
          select: { price: true },
        },
      },
    });

    // Métricas de citas
    const appointmentMetrics = {
      total: appointments.length,
      scheduled: appointments.filter(
        (a) => a.status === AppointmentStatus.SCHEDULED,
      ).length,
      confirmed: appointments.filter(
        (a) => a.status === AppointmentStatus.CONFIRMED,
      ).length,
      completed: appointments.filter(
        (a) => a.status === AppointmentStatus.COMPLETED,
      ).length,
      cancelled: appointments.filter(
        (a) => a.status === AppointmentStatus.CANCELLED,
      ).length,
      noShow: appointments.filter((a) => a.status === AppointmentStatus.NO_SHOW)
        .length,
    };

    // Métricas de revenue
    const completedAppointments = appointments.filter(
      (a) => a.status === AppointmentStatus.COMPLETED,
    );
    const totalRevenue = completedAppointments.reduce((sum, a) => {
      return sum + (a.service?.price ? a.service.price.toNumber() : 0);
    }, 0);

    const estimatedRevenue = appointments
      .filter((a) => a.status !== AppointmentStatus.CANCELLED)
      .reduce((sum, a) => {
        return sum + (a.service?.price ? a.service.price.toNumber() : 0);
      }, 0);

    const averageAppointmentValue =
      completedAppointments.length > 0
        ? totalRevenue / completedAppointments.length
        : 0;

    // Métricas de clientes
    const clientIds = new Set(appointments.map((a) => a.userId));
    const newClients = await this.prisma.client.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    // Calcular utilización (slots disponibles vs reservados)
    const workingHours = await this.prisma.workingHours.findMany({
      where: { tenantId, isActive: true },
    });

    const exceptionDates = await this.prisma.exceptionDate.findMany({
      where: {
        tenantId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        isBlocked: true,
      },
    });

    const totalWorkingDays = this.calculateWorkingDays(
      startDate,
      endDate,
      workingHours.map((w) => w.dayOfWeek),
      exceptionDates.map((e) => e.date.toISOString().split('T')[0]),
    );

    const averageHoursPerDay =
      workingHours.reduce((sum, w) => {
        const start = parseInt(w.startTime.split(':')[0]);
        const end = parseInt(w.endTime.split(':')[0]);
        return sum + (end - start);
      }, 0) / (workingHours.length || 1);

    const totalSlots = totalWorkingDays * averageHoursPerDay * 2; // 2 slots por hora (30 min)
    const bookedSlots = appointments.filter(
      (a) => a.status !== AppointmentStatus.CANCELLED,
    ).length;

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      appointments: appointmentMetrics,
      revenue: {
        totalRevenue,
        estimatedRevenue,
        averageAppointmentValue,
      },
      clientMetrics: {
        totalClients: clientIds.size,
        newClients,
        returningClients: clientIds.size - newClients,
      },
      utilization: {
        totalSlots: Math.round(totalSlots),
        bookedSlots,
        utilizationRate:
          totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0,
      },
    };
  }

  async getFullReport(
    tenantId: string,
    query: AnalyticsQueryDto,
  ): Promise<AnalyticsReportDto> {
    const { startDate, endDate, period = AnalyticsPeriod.DAY } = query;

    const metrics = await this.getDashboardMetrics(tenantId, query);

    // Datos de series temporales
    const timeSeries = await this.getTimeSeriesData(
      tenantId,
      startDate || metrics.period.start,
      endDate || metrics.period.end,
      period,
    );

    // Top servicios
    const topServices = await this.getTopServices(tenantId, startDate, endDate);

    return {
      metrics,
      timeSeries,
      topServices,
    };
  }

  private async getTimeSeriesData(
    tenantId: string,
    startDate: string,
    endDate: string,
    period: AnalyticsPeriod,
  ): Promise<TimeSeriesDataPointDto[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        startsAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        service: {
          select: { price: true },
        },
      },
      orderBy: { startsAt: 'asc' },
    });

    // Agrupar por período
    const grouped = new Map<
      string,
      { appointments: number; revenue: number; cancelled: number }
    >();

    appointments.forEach((a) => {
      const date = this.getPeriodKey(a.startsAt, period);
      const current = grouped.get(date) || {
        appointments: 0,
        revenue: 0,
        cancelled: 0,
      };

      current.appointments++;
      if (a.status === AppointmentStatus.CANCELLED) {
        current.cancelled++;
      } else if (a.status === AppointmentStatus.COMPLETED) {
        current.revenue += a.service?.price ? a.service.price.toNumber() : 0;
      }

      grouped.set(date, current);
    });

    return Array.from(grouped.entries()).map(([date, data]) => ({
      date,
      appointments: data.appointments,
      revenue: data.revenue,
      cancelled: data.cancelled,
    }));
  }

  private async getTopServices(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<
    Array<{
      serviceId: string;
      serviceName: string;
      count: number;
      revenue: number;
    }>
  > {
    const where: {
      tenantId: string;
      status: { not: AppointmentStatus };
      serviceId: { not: null };
      startsAt?: { gte: Date; lte: Date };
    } = {
      tenantId,
      status: { not: AppointmentStatus.CANCELLED },
      serviceId: { not: null },
    };

    if (startDate && endDate) {
      where.startsAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        service: {
          select: { id: true, name: true, price: true },
        },
      },
    });

    const serviceMap = new Map<
      string,
      { serviceId: string; serviceName: string; count: number; revenue: number }
    >();

    appointments.forEach((a) => {
      if (!a.service) return;

      const existing = serviceMap.get(a.service.id);
      if (existing) {
        existing.count++;
        existing.revenue += a.service.price ? a.service.price.toNumber() : 0;
      } else {
        serviceMap.set(a.service.id, {
          serviceId: a.service.id,
          serviceName: a.service.name,
          count: 1,
          revenue: a.service.price ? a.service.price.toNumber() : 0,
        });
      }
    });

    return Array.from(serviceMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getDateRange(query: AnalyticsQueryDto): {
    startDate: string;
    endDate: string;
  } {
    if (query.startDate && query.endDate) {
      return { startDate: query.startDate, endDate: query.endDate };
    }

    // Default: últimos 30 días
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  }

  private getPeriodKey(date: Date, period: AnalyticsPeriod): string {
    const d = new Date(date);

    switch (period) {
      case AnalyticsPeriod.DAY:
        return d.toISOString().split('T')[0];
      case AnalyticsPeriod.WEEK: {
        const weekStart = new Date(d.setDate(d.getDate() - d.getDay()));
        return weekStart.toISOString().split('T')[0];
      }
      case AnalyticsPeriod.MONTH:
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      case AnalyticsPeriod.YEAR:
        return `${d.getFullYear()}`;
      default:
        return d.toISOString().split('T')[0];
    }
  }

  private calculateWorkingDays(
    startDate: string,
    endDate: string,
    workingDaysOfWeek: number[],
    blockedDates: string[],
  ): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;

    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dateStr = current.toISOString().split('T')[0];

      if (
        workingDaysOfWeek.includes(dayOfWeek) &&
        !blockedDates.includes(dateStr)
      ) {
        workingDays++;
      }

      current.setDate(current.getDate() + 1);
    }

    return workingDays;
  }

  // Métricas rápidas para el dashboard header
  async getQuickStats(tenantId: string): Promise<{
    todayAppointments: number;
    weekAppointments: number;
    monthRevenue: number;
    newClientsThisMonth: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(today);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayAppointments = await this.prisma.appointment.count({
      where: {
        tenantId,
        startsAt: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: { not: AppointmentStatus.CANCELLED },
      },
    });

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekAppointments = await this.prisma.appointment.count({
      where: {
        tenantId,
        startsAt: {
          gte: weekStart,
        },
        status: { not: AppointmentStatus.CANCELLED },
      },
    });

    const monthStart = new Date();
    monthStart.setDate(1);
    const monthAppointments = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        startsAt: {
          gte: monthStart,
        },
        status: AppointmentStatus.COMPLETED,
      },
      include: {
        service: { select: { price: true } },
      },
    });

    const monthRevenue = monthAppointments.reduce((sum, a) => {
      return sum + (a.service?.price ? a.service.price.toNumber() : 0);
    }, 0);

    const newClientsThisMonth = await this.prisma.client.count({
      where: {
        tenantId,
        createdAt: {
          gte: monthStart,
        },
      },
    });

    return {
      todayAppointments,
      weekAppointments,
      monthRevenue,
      newClientsThisMonth,
    };
  }
}
