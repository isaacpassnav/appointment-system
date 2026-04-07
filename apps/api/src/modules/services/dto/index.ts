import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Service } from '@prisma/client';

export class CreateServiceDto {
  @ApiProperty({ description: 'Service name', example: 'Haircut' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Service description', example: 'Professional haircut with styling' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Duration in minutes', example: 30 })
  @IsNumber()
  @Min(5)
  @Max(480)
  duration: number;

  @ApiPropertyOptional({ description: 'Price', example: 25.99 })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'Color for calendar display', example: '#7c6eff' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({ description: 'Service name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Service description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(480)
  duration?: number;

  @ApiPropertyOptional({ description: 'Price' })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'Color for calendar display' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Whether service is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ServiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  description: string | null;

  @ApiProperty()
  duration: number;

  @ApiPropertyOptional({ type: Number, nullable: true })
  price: number | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  color: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ServiceQueryDto {
  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Include inactive services' })
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean;
}
