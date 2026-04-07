import {
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum AnalyticsPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: AnalyticsPeriod, description: 'Period grouping' })
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod;
}

export class AppointmentMetricsDto {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export class RevenueMetricsDto {
  totalRevenue: number;
  estimatedRevenue: number;
  averageAppointmentValue: number;
}

export class TimeSlotMetricsDto {
  mostPopularDay: string;
  mostPopularTime: string;
  averageSlotsPerDay: number;
}

export class DashboardMetricsDto {
  period: {
    start: string;
    end: string;
  };
  appointments: AppointmentMetricsDto;
  revenue: RevenueMetricsDto;
  clientMetrics: {
    totalClients: number;
    newClients: number;
    returningClients: number;
  };
  utilization: {
    totalSlots: number;
    bookedSlots: number;
    utilizationRate: number;
  };
}

export class TimeSeriesDataPointDto {
  date: string;
  appointments: number;
  revenue: number;
  cancelled: number;
}

export class AnalyticsReportDto {
  metrics: DashboardMetricsDto;
  timeSeries: TimeSeriesDataPointDto[];
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }>;
}
