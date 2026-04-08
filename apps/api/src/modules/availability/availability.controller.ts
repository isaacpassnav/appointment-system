import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import {
  CreateWorkingHoursDto,
  UpdateWorkingHoursDto,
  CreateExceptionDateDto,
  AvailableSlotsQueryDto,
  BatchWorkingHoursDto,
} from './dto';
import { AccessTokenGuard } from '@/modules/auth/guards/access-token.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { RequestTenantContext } from '@/common/interfaces/request-tenant-context.interface';

@ApiTags('Availability')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // ==================== Working Hours ====================

  @Post('working-hours')
  @ApiOperation({ summary: 'Create working hours for a day' })
  async createWorkingHours(
    @Body() dto: CreateWorkingHoursDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.availabilityService.createWorkingHours(context.tenantId, dto);
  }

  @Get('working-hours')
  @ApiOperation({ summary: 'Get all working hours for tenant' })
  async getWorkingHours(@CurrentUser() context: RequestTenantContext) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.availabilityService.getWorkingHours(context.tenantId);
  }

  @Put('working-hours/:dayOfWeek')
  @ApiOperation({ summary: 'Update working hours for a day (0-6)' })
  async updateWorkingHours(
    @Param('dayOfWeek') dayOfWeek: string,
    @Body() dto: UpdateWorkingHoursDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    const day = parseInt(dayOfWeek, 10);
    if (isNaN(day) || day < 0 || day > 6) {
      throw new BadRequestException('dayOfWeek must be between 0 and 6');
    }
    return this.availabilityService.updateWorkingHours(
      context.tenantId,
      day,
      dto,
    );
  }

  @Delete('working-hours/:dayOfWeek')
  @ApiOperation({ summary: 'Delete working hours for a day' })
  async deleteWorkingHours(
    @Param('dayOfWeek') dayOfWeek: string,
    @CurrentUser() context: RequestTenantContext,
  ): Promise<void> {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    const day = parseInt(dayOfWeek, 10);
    if (isNaN(day) || day < 0 || day > 6) {
      throw new BadRequestException('dayOfWeek must be between 0 and 6');
    }
    await this.availabilityService.deleteWorkingHours(context.tenantId, day);
  }

  @Post('working-hours/batch')
  @ApiOperation({ summary: 'Set all working hours at once' })
  async setWorkingHoursBatch(
    @Body() dto: BatchWorkingHoursDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.availabilityService.setWorkingHoursBatch(
      context.tenantId,
      dto.workingHours,
    );
  }

  // ==================== Exception Dates ====================

  @Post('exceptions')
  @ApiOperation({ summary: 'Create an exception date' })
  async createExceptionDate(
    @Body() dto: CreateExceptionDateDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.availabilityService.createExceptionDate(context.tenantId, dto);
  }

  @Get('exceptions')
  @ApiOperation({
    summary: 'Get exception dates (optionally filtered by date range)',
  })
  async getExceptionDates(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.availabilityService.getExceptionDates(
      context.tenantId,
      startDate,
      endDate,
    );
  }

  @Delete('exceptions/:id')
  @ApiOperation({ summary: 'Delete an exception date' })
  async deleteExceptionDate(
    @Param('id') id: string,
    @CurrentUser() context: RequestTenantContext,
  ): Promise<void> {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    await this.availabilityService.deleteExceptionDate(context.tenantId, id);
  }

  // ==================== Available Slots ====================

  @Get('slots')
  @ApiOperation({ summary: 'Get available time slots for a date' })
  async getAvailableSlots(
    @Query() query: AvailableSlotsQueryDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.availabilityService.getAvailableSlots(context.tenantId, query);
  }
}
