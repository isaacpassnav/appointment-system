import {
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsISO8601()
  startsAt!: string;

  @IsInt()
  @Min(15)
  @Max(720)
  durationMinutes!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
