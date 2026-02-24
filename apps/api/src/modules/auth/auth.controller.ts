import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Create a new user account' })
  @ApiBody({ type: SignUpDto })
  @Throttle({ auth: { limit: 8, ttl: 60_000 } })
  @Post('signup')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @ApiOperation({ summary: 'Sign in and receive access/refresh tokens' })
  @ApiBody({ type: SignInDto })
  @Throttle({ auth: { limit: 12, ttl: 60_000 } })
  @Post('signin')
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @ApiOperation({ summary: 'Exchange a refresh token for new tokens' })
  @ApiBody({ type: RefreshTokenDto })
  @Throttle({ auth: { limit: 15, ttl: 60_000 } })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Return the current authenticated user profile' })
  @ApiOkResponse({ description: 'Authenticated user profile' })
  @Throttle({ private: { limit: 180, ttl: 60_000 } })
  @UseGuards(AccessTokenGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user.sub);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Invalidate refresh token hash for current user' })
  @Throttle({ private: { limit: 120, ttl: 60_000 } })
  @UseGuards(AccessTokenGuard)
  @Post('logout')
  logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub);
  }
}
