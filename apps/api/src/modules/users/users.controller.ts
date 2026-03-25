import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto, UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Create user (legacy endpoint, prefer /api/auth/signup)',
  })
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateUserDto) {
    return this.usersService.createInTenant(user.tenantId, dto);
  }

  @ApiOperation({ summary: 'List users' })
  @Throttle({ private: { limit: 120, ttl: 60_000 } })
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.usersService.findAllForTenant(user.tenantId);
  }

  @ApiOperation({ summary: 'Get user by id' })
  @Throttle({ private: { limit: 120, ttl: 60_000 } })
  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.usersService.findOneForTenant(user.tenantId, id);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @Throttle({ private: { limit: 120, ttl: 60_000 } })
  @Get('me/profile')
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findOne(user.sub);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @Throttle({ private: { limit: 60, ttl: 60_000 } })
  @Patch('me/profile')
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @ApiOperation({ summary: 'Update current user password' })
  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @Patch('me/password')
  async updatePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(user.sub, dto);
  }
}