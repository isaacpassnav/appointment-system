import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentsService } from './appointments.service';

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
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAppointmentDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.appointmentsService.create(
      user.sub,
      user.tenantId,
      dto,
      idempotencyKey,
    );
  }

  @ApiOperation({ summary: 'List current user appointments' })
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.appointmentsService.findAll(user.sub, user.tenantId);
  }

  @ApiOperation({ summary: 'Get a single appointment by id' })
  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.appointmentsService.findOne(user.sub, user.tenantId, id);
  }

  @ApiOperation({ summary: 'Cancel an appointment by id' })
  @Patch(':id/cancel')
  cancel(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.appointmentsService.cancel(user.sub, user.tenantId, id);
  }
}
