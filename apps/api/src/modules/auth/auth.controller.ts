import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';

type VerifyEmailReply = {
  redirect(statusCode: number, url: string): Promise<void> | void;
  send(payload: unknown): Promise<void> | void;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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

  @ApiOperation({ summary: 'Verify email account with token' })
  @ApiQuery({ name: 'token', required: true })
  @Throttle({ auth: { limit: 20, ttl: 60_000 } })
  @Get('verify')
  verifyEmail(@Query() query: VerifyEmailDto) {
    return this.authService.verifyEmail(query.token);
  }

  @ApiOperation({ summary: 'Verify email account with token (alias)' })
  @ApiQuery({ name: 'token', required: true })
  @Throttle({ auth: { limit: 20, ttl: 60_000 } })
  @Get('verify-email')
  @ApiExcludeEndpoint()
  async verifyEmailAlias(
    @Query() query: VerifyEmailDto,
    @Res() reply: VerifyEmailReply,
  ): Promise<void> {
    const redirectTarget = this.buildVerifyRedirectUrl(query.token);
    if (redirectTarget) {
      await reply.redirect(302, redirectTarget);
      return;
    }

    const result = await this.authService.verifyEmail(query.token);
    await reply.send(result);
  }

  @ApiOperation({ summary: 'Resend verification email' })
  @ApiBody({ type: ResendVerificationDto })
  @Throttle({ auth: { limit: 6, ttl: 60_000 } })
  @Post('resend-verification')
  resendVerificationEmail(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
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

  private buildVerifyRedirectUrl(token: string) {
    const frontendBase = this.configService.get<string>(
      'FRONTEND_PUBLIC_BASE_URL',
    );

    if (!frontendBase) {
      return null;
    }

    const normalizedFrontendBase = frontendBase.replace(/\/$/, '');
    return `${normalizedFrontendBase}/verify-email?token=${encodeURIComponent(token)}`;
  }
}
