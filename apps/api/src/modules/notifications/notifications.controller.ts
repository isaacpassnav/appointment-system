import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@Throttle({ private: { limit: 120, ttl: 60_000 } })
@UseGuards(AccessTokenGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({
    summary: 'Get tenant delivery metrics for appointment notification emails',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Window size in days (1-30). Default: 7',
    example: 7,
  })
  @Get('metrics')
  metrics(@CurrentUser() user: JwtPayload, @Query('days') daysRaw?: string) {
    const days = this.parseDays(daysRaw);
    return this.notificationsService.getTenantDeliveryMetrics(
      user.tenantId,
      days,
    );
  }

  private parseDays(rawValue?: string) {
    if (!rawValue) {
      return 7;
    }

    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return 7;
    }

    return Math.min(30, Math.floor(parsed));
  }
}
