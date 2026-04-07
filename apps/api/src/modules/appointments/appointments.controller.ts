import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentsService } from './appointments.service';
import type { RequestTenantContext } from '@/common/interfaces/request-tenant-context.interface';

@ApiTags('appointments')
@ApiBearerAuth('access-token')
@Throttle({ private: { limit: 180, ttl: 60_000 } })
@UseGuards(AccessTokenGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @ApiOperation({ summary: 'Create a new appointment for current user' })
  @ApiHeader({
    name: 'x-idempotency-key',
    required: false,
    description:
      'Optional request key to safely retry appointment creation without duplicates.',
  })
  @Post()
  create(
    @CurrentUser() user: RequestTenantContext,
    @Body() dto: CreateAppointmentDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.appointmentsService.create(
      user.userId,
      user.tenantId!,
      dto,
      idempotencyKey,
    );
  }

  @ApiOperation({ summary: 'List current user appointments' })
  @Get()
  findAll(@CurrentUser() user: RequestTenantContext) {
    return this.appointmentsService.findAll(user.userId, user.tenantId!);
  }

  @ApiOperation({ summary: 'Get a single appointment by id' })
  @Get(':id')
  findOne(
    @CurrentUser() user: RequestTenantContext,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.appointmentsService.findOne(user.userId, user.tenantId!, id);
  }

  @ApiOperation({ summary: 'Update an appointment (reschedule or change service)' })
  @Put(':id')
  update(
    @CurrentUser() user: RequestTenantContext,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(user.userId, user.tenantId!, id, dto);
  }

  @ApiOperation({ summary: 'Update an appointment (partial)' })
  @Patch(':id')
  patch(
    @CurrentUser() user: RequestTenantContext,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(user.userId, user.tenantId!, id, dto);
  }

  @ApiOperation({ summary: 'Cancel an appointment by id' })
  @Patch(':id/cancel')
  cancel(
    @CurrentUser() user: RequestTenantContext,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.appointmentsService.cancel(user.userId, user.tenantId!, id);
  }
}
