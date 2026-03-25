import {
  IsEmail,
  IsOptional,
  IsString,
  IsTimeZone,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Full name of the user' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: 'Timezone (e.g., America/Lima)' })
  @IsOptional()
  @IsTimeZone()
  timezone?: string;
}

export class UpdatePasswordDto {
  @ApiPropertyOptional({ description: 'Current password' })
  @IsString()
  @Length(8, 100)
  currentPassword!: string;

  @ApiPropertyOptional({ description: 'New password' })
  @IsString()
  @Length(8, 100)
  newPassword!: string;
}
