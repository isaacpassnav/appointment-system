import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEmail,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantSettingsDto {
  @ApiPropertyOptional({ description: 'Business display name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  businessName?: string;

  @ApiPropertyOptional({ description: 'Business contact email' })
  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @ApiPropertyOptional({ description: 'Business phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  businessPhone?: string;

  @ApiPropertyOptional({ description: 'Business address' })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Hours before appointment to send reminder', default: 24 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168)
  reminderHoursBefore?: number;

  @ApiPropertyOptional({ description: 'Enable email reminders', default: true })
  @IsOptional()
  @IsBoolean()
  enableEmailReminders?: boolean;

  @ApiPropertyOptional({ description: 'Enable SMS reminders', default: false })
  @IsOptional()
  @IsBoolean()
  enableSmsReminders?: boolean;

  @ApiPropertyOptional({ description: 'Minimum hours notice required for booking', default: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(168)
  minBookingNoticeHours?: number;

  @ApiPropertyOptional({ description: 'Maximum days in advance for booking', default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  maxBookingAdvanceDays?: number;

  @ApiPropertyOptional({ description: 'Allow same day bookings', default: true })
  @IsOptional()
  @IsBoolean()
  allowSameDayBooking?: boolean;

  @ApiPropertyOptional({ description: 'Hours required for cancellation', default: 24 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cancellationPolicyHours?: number;

  @ApiPropertyOptional({ description: 'Default timezone', default: 'UTC' })
  @IsOptional()
  @IsString()
  defaultTimezone?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTenantSettingsDto extends CreateTenantSettingsDto {}

export class TenantSettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  businessName: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  businessEmail: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  businessPhone: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  businessAddress: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  logoUrl: string | null;

  @ApiProperty()
  reminderHoursBefore: number;

  @ApiProperty()
  enableEmailReminders: boolean;

  @ApiProperty()
  enableSmsReminders: boolean;

  @ApiProperty()
  minBookingNoticeHours: number;

  @ApiProperty()
  maxBookingAdvanceDays: number;

  @ApiProperty()
  allowSameDayBooking: boolean;

  @ApiProperty()
  cancellationPolicyHours: number;

  @ApiProperty()
  defaultTimezone: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  notes: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
