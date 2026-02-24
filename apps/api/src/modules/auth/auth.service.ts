import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(dto: SignUpDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered.');
    }

    const user = await this.usersService.create(dto);
    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.usersService.setRefreshTokenHash(user.id, tokens.refreshToken);
    return { user, ...tokens };
  }

  async signIn(dto: SignInDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    await this.usersService.setRefreshTokenHash(user.id, tokens.refreshToken);

    const publicUser = await this.usersService.findOne(user.id);
    return { user: publicUser, ...tokens };
  }

  async refresh(dto: RefreshTokenDto) {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is required.');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        dto.refreshToken,
        {
          secret: refreshSecret,
        },
      );
    } catch {
      throw new UnauthorizedException('Refresh token is not valid.');
    }

    const user = await this.usersService.findAuthById(payload.sub);
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }

    const validRefreshHash = await bcrypt.compare(
      dto.refreshToken,
      user.refreshTokenHash,
    );

    if (!validRefreshHash) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }

    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    await this.usersService.setRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.clearRefreshTokenHash(userId);
    return { success: true };
  }

  async me(userId: string) {
    return this.usersService.findOne(userId);
  }

  private async issueTokens(payload: JwtPayload) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const accessExpiresIn = this.parseExpiresInToSeconds(
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    );
    const refreshExpiresIn = this.parseExpiresInToSeconds(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    );

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are required.');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private parseExpiresInToSeconds(value: string): number {
    const normalized = value.trim().toLowerCase();
    if (/^\d+$/.test(normalized)) {
      return Number(normalized);
    }

    const match = normalized.match(/^(\d+)([smhdw])$/);
    if (!match) {
      throw new Error(`Invalid JWT expiration format: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 60 * 60 * 24,
      w: 60 * 60 * 24 * 7,
    };

    return amount * multipliers[unit];
  }
}
