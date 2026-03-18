import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class SignUpDto extends CreateUserDto {
  @ApiPropertyOptional({ example: 'Barberia Prime' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  tenantName?: string;

  @ApiPropertyOptional({
    example: 'barberia-prime',
    description:
      'Optional tenant slug. Lowercase letters, numbers, and hyphens.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  tenantSlug?: string;
}
