import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto';
import { AccessTokenGuard } from '@/modules/auth/guards/access-token.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { RequestTenantContext } from '@/common/interfaces/request-tenant-context.interface';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard metrics' })
  async getDashboard(
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.analyticsService.getDashboardMetrics(context.tenantId, query);
  }

  @Get('report')
  @ApiOperation({ summary: 'Get full analytics report with time series' })
  async getFullReport(
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.analyticsService.getFullReport(context.tenantId, query);
  }

  @Get('quick-stats')
  @ApiOperation({ summary: 'Get quick stats for dashboard header' })
  async getQuickStats(@CurrentUser() context: RequestTenantContext) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.analyticsService.getQuickStats(context.tenantId);
  }
}
