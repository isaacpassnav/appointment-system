import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token received via email.',
    example: 'f52c31373f1c9b7aa46d95874011e0ebe9e1a9f5e65388db597f4607ceeb9a6f',
  })
  @IsString()
  @Length(20, 256)
  token!: string;
}
