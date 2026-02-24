import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub);
  }
}
