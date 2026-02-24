import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
