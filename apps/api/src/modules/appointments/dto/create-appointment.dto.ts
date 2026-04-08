import {
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    format: 'date-time',
    example: '2026-03-01T14:00:00.000Z',
  })
  @IsISO8601()
  startsAt!: string;

  @ApiPropertyOptional({
    description: 'Service ID (optional, will use service duration if provided)',
    example: 'uuid-service-id',
  })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional({
    description: 'Client ID (optional, for booking on behalf of a client)',
    example: 'uuid-client-id',
  })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({
    minimum: 15,
    maximum: 720,
    example: 30,
    description:
      'Duration in minutes (overrides service duration if serviceId provided)',
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(720)
  durationMinutes?: number;

  @ApiPropertyOptional({ maxLength: 500, example: 'Initial consultation.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @ApiPropertyOptional({ description: 'Service ID' })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
