import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ example: 'isaac@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, maxLength: 72, example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiPropertyOptional({
    description: 'Tenant context to authenticate against',
    example: 'e3f4c5d6-7a89-4bcd-9e01-234567890abc',
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
