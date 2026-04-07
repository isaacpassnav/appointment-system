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
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, ClientQueryDto } from './dto';
import { AccessTokenGuard } from '@/modules/auth/guards/access-token.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { RequestTenantContext } from '@/common/interfaces/request-tenant-context.interface';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  async create(
    @Body() dto: CreateClientDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.clientsService.create(context.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients for tenant' })
  async findAll(
    @Query() query: ClientQueryDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.clientsService.findAll(context.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by id' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.clientsService.findOne(context.tenantId, id);
  }

  @Get(':id/appointments')
  @ApiOperation({ summary: 'Get client appointment history' })
  async getClientAppointments(
    @Param('id') id: string,
    @Query('limit') limit: string,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.clientsService.getClientAppointments(
      context.tenantId,
      id,
      limitNum,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update client (full)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.clientsService.update(context.tenantId, id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update client (partial)' })
  async patch(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() context: RequestTenantContext,
  ) {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.clientsService.update(context.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete client' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() context: RequestTenantContext,
  ): Promise<void> {
    if (!context.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    await this.clientsService.remove(context.tenantId, id);
  }
}
