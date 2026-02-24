import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'isaac@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, maxLength: 72, example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ maxLength: 120, example: 'Isaac Pasapera' })
  @IsString()
  @MaxLength(120)
  fullName!: string;

  @ApiPropertyOptional({ maxLength: 30, example: '+51999999999' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ maxLength: 60, example: 'America/Lima' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  timezone?: string;
}
