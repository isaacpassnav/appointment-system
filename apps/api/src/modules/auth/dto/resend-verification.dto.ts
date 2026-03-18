import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({
    description: 'Email address used during signup.',
    example: 'owner@company.com',
  })
  @IsEmail()
  email!: string;
}
