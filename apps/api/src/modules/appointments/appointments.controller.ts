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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentsService } from './appointments.service';

@UseGuards(AccessTokenGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.appointmentsService.findAll(user.sub);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.appointmentsService.findOne(user.sub, id);
  }

  @Patch(':id/cancel')
  cancel(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.appointmentsService.cancel(user.sub, id);
  }
}
