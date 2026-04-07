import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  Max,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// DTO para WorkingHours
export class CreateWorkingHoursDto {
  @ApiProperty({ description: 'Day of week (0=Sunday, 6=Saturday)', example: 1, minimum: 0, maximum: 6 })
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ description: 'Start time (HH:mm)', example: '09:00' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;

  @ApiProperty({ description: 'End time (HH:mm)', example: '18:00' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be in HH:mm format' })
  endTime: string;

  @ApiPropertyOptional({ description: 'Whether this day is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateWorkingHoursDto {
  @ApiPropertyOptional({ description: 'Start time (HH:mm)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:mm format' })
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time (HH:mm)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be in HH:mm format' })
  endTime?: string;

  @ApiPropertyOptional({ description: 'Whether this day is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class WorkingHoursResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty({ description: 'Day of week (0=Sunday, 6=Saturday)', minimum: 0, maximum: 6 })
  dayOfWeek: number;

  @ApiProperty({ description: 'Start time (HH:mm)' })
  startTime: string;

  @ApiProperty({ description: 'End time (HH:mm)' })
  endTime: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// DTO para ExceptionDate
export class CreateExceptionDateDto {
  @ApiProperty({ description: 'Date (YYYY-MM-DD)', example: '2024-12-25' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'Reason for exception', example: 'Christmas' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Whether the day is fully blocked', default: true })
  @IsBoolean()
  isBlocked: boolean;

  @ApiPropertyOptional({ description: 'Special start time if not blocked (HH:mm)', example: '10:00' })
  @ValidateIf((o) => !o.isBlocked)
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:mm format' })
  startTime?: string;

  @ApiPropertyOptional({ description: 'Special end time if not blocked (HH:mm)', example: '14:00' })
  @ValidateIf((o) => !o.isBlocked)
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be in HH:mm format' })
  endTime?: string;
}

export class ExceptionDateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty({ description: 'Date (YYYY-MM-DD)' })
  date: Date;

  @ApiPropertyOptional({ type: String, nullable: true })
  reason: string | null;

  @ApiProperty()
  isBlocked: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  startTime: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  endTime: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// DTO para consulta de slots disponibles
export class AvailableSlotsQueryDto {
  @ApiProperty({ description: 'Date to check (YYYY-MM-DD)', example: '2024-06-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'Service ID to check duration', example: 'uuid-service' })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes (overrides service duration)', example: 60 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(480)
  durationMinutes?: number;
}

export class AvailableSlotDto {
  @ApiProperty({ description: 'Start time (HH:mm)', example: '09:00' })
  startTime: string;

  @ApiProperty({ description: 'End time (HH:mm)', example: '10:00' })
  endTime: string;

  @ApiProperty({ description: 'Whether this slot is available', example: true })
  available: boolean;
}

export class AvailableSlotsResponseDto {
  @ApiProperty({ description: 'Date queried', example: '2024-06-15' })
  date: string;

  @ApiProperty({ description: 'Day of week (0=Sunday, 6=Saturday)', example: 1 })
  dayOfWeek: number;

  @ApiProperty({ description: 'Whether the day is fully blocked', example: false })
  isBlocked: boolean;

  @ApiProperty({ description: 'Exception reason if blocked', nullable: true, type: String })
  exceptionReason: string | null;

  @ApiProperty({ type: [AvailableSlotDto] })
  slots: AvailableSlotDto[];
}

// DTO para batch update de working hours
export class BatchWorkingHoursDto {
  @ApiProperty({ type: [CreateWorkingHoursDto], description: 'Working hours for all days' })
  workingHours: CreateWorkingHoursDto[];
}
