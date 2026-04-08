import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto, ServiceQueryDto } from './dto';
import { AccessTokenGuard } from '@/modules/auth/guards/access-token.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { RequestTenantContext } from '@/common/interfaces/request-tenant-context.interface';

@ApiTags('Services')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  async create(
    @Body() dto: CreateServiceDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.servicesService.create(context.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services for tenant' })
  async findAll(
    @Query() query: ServiceQueryDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.servicesService.findAll(context.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by id' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.servicesService.findOne(context.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update service (full)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.servicesService.update(context.tenantId, id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service (partial)' })
  async patch(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.servicesService.update(context.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete service' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() context: RequestTenantContext,
  ): Promise<void> {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    await this.servicesService.remove(context.tenantId, id);
  }
}
