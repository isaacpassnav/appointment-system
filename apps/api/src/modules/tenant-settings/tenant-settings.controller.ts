import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TenantSettingsService } from './tenant-settings.service';
import { CreateTenantSettingsDto, UpdateTenantSettingsDto } from './dto';
import { AccessTokenGuard } from '@/modules/auth/guards/access-token.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { RequestTenantContext } from '@/common/interfaces/request-tenant-context.interface';

@ApiTags('Tenant Settings')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('tenant-settings')
export class TenantSettingsController {
  constructor(private readonly tenantSettingsService: TenantSettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create tenant settings' })
  async create(
    @Body() dto: CreateTenantSettingsDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.tenantSettingsService.create(context.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get tenant settings' })
  async findOne(@CurrentUser() context: RequestTenantContext) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.tenantSettingsService.getOrCreate(context.tenantId);
  }

  @Put()
  @ApiOperation({ summary: 'Update tenant settings (full)' })
  async update(
    @Body() dto: UpdateTenantSettingsDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.tenantSettingsService.update(context.tenantId, dto);
  }

  @Patch()
  @ApiOperation({ summary: 'Update tenant settings (partial)' })
  async patch(
    @Body() dto: UpdateTenantSettingsDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.tenantSettingsService.update(context.tenantId, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete tenant settings' })
  async remove(@CurrentUser() context: RequestTenantContext): Promise<void> {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    await this.tenantSettingsService.delete(context.tenantId);
  }
}
