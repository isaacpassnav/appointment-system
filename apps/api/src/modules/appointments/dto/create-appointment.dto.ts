import {
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
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

  @ApiProperty({
    minimum: 15,
    maximum: 720,
    example: 30,
  })
  @IsInt()
  @Min(15)
  @Max(720)
  durationMinutes!: number;

  @ApiPropertyOptional({ maxLength: 500, example: 'Initial consultation.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
