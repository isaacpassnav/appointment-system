import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'Client email', example: 'client@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Client name', example: 'John Doe' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Client phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: 'Internal notes about client' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Link to existing user account', example: 'uuid-user-id' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class UpdateClientDto {
  @ApiPropertyOptional({ description: 'Client email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Client name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Client phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: 'Internal notes about client' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether client is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ClientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  userId: string | null;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  notes: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ClientQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Include inactive clients' })
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean;
}
