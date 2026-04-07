import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateTenantSettingsDto,
  UpdateTenantSettingsDto,
  TenantSettingsResponseDto,
} from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TenantSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    tenantId: string,
    dto: CreateTenantSettingsDto,
  ): Promise<TenantSettingsResponseDto> {
    // Check if settings already exist
    const existing = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    if (existing) {
      return this.update(tenantId, dto);
    }

    const data: Prisma.TenantSettingsCreateInput = {
      businessName: dto.businessName,
      businessEmail: dto.businessEmail,
      businessPhone: dto.businessPhone,
      businessAddress: dto.businessAddress,
      logoUrl: dto.logoUrl,
      reminderHoursBefore: dto.reminderHoursBefore ?? 24,
      enableEmailReminders: dto.enableEmailReminders ?? true,
      enableSmsReminders: dto.enableSmsReminders ?? false,
      minBookingNoticeHours: dto.minBookingNoticeHours ?? 2,
      maxBookingAdvanceDays: dto.maxBookingAdvanceDays ?? 30,
      allowSameDayBooking: dto.allowSameDayBooking ?? true,
      cancellationPolicyHours: dto.cancellationPolicyHours ?? 24,
      defaultTimezone: dto.defaultTimezone ?? 'UTC',
      notes: dto.notes,
      tenant: { connect: { id: tenantId } },
    };

    const created = await this.prisma.tenantSettings.create({ data });
    return this.mapToDto(created);
  }

  async findOne(tenantId: string): Promise<TenantSettingsResponseDto | null> {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    return settings ? this.mapToDto(settings) : null;
  }

  async getOrCreate(tenantId: string): Promise<TenantSettingsResponseDto> {
    const existing = await this.findOne(tenantId);
    if (existing) {
      return existing;
    }

    // Create with defaults
    return this.create(tenantId, {});
  }

  async update(
    tenantId: string,
    dto: UpdateTenantSettingsDto,
  ): Promise<TenantSettingsResponseDto> {
    const existing = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    if (!existing) {
      return this.create(tenantId, dto);
    }

    const data: Prisma.TenantSettingsUpdateInput = {};

    if (dto.businessName !== undefined) data.businessName = dto.businessName;
    if (dto.businessEmail !== undefined) data.businessEmail = dto.businessEmail;
    if (dto.businessPhone !== undefined) data.businessPhone = dto.businessPhone;
    if (dto.businessAddress !== undefined) data.businessAddress = dto.businessAddress;
    if (dto.logoUrl !== undefined) data.logoUrl = dto.logoUrl;
    if (dto.reminderHoursBefore !== undefined) data.reminderHoursBefore = dto.reminderHoursBefore;
    if (dto.enableEmailReminders !== undefined) data.enableEmailReminders = dto.enableEmailReminders;
    if (dto.enableSmsReminders !== undefined) data.enableSmsReminders = dto.enableSmsReminders;
    if (dto.minBookingNoticeHours !== undefined) data.minBookingNoticeHours = dto.minBookingNoticeHours;
    if (dto.maxBookingAdvanceDays !== undefined) data.maxBookingAdvanceDays = dto.maxBookingAdvanceDays;
    if (dto.allowSameDayBooking !== undefined) data.allowSameDayBooking = dto.allowSameDayBooking;
    if (dto.cancellationPolicyHours !== undefined) data.cancellationPolicyHours = dto.cancellationPolicyHours;
    if (dto.defaultTimezone !== undefined) data.defaultTimezone = dto.defaultTimezone;
    if (dto.notes !== undefined) data.notes = dto.notes;

    const updated = await this.prisma.tenantSettings.update({
      where: { tenantId },
      data,
    });

    return this.mapToDto(updated);
  }

  async delete(tenantId: string): Promise<void> {
    const existing = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Tenant settings not found');
    }

    await this.prisma.tenantSettings.delete({
      where: { tenantId },
    });
  }

  private mapToDto(settings: any): TenantSettingsResponseDto {
    return {
      id: settings.id,
      tenantId: settings.tenantId,
      businessName: settings.businessName,
      businessEmail: settings.businessEmail,
      businessPhone: settings.businessPhone,
      businessAddress: settings.businessAddress,
      logoUrl: settings.logoUrl,
      reminderHoursBefore: settings.reminderHoursBefore,
      enableEmailReminders: settings.enableEmailReminders,
      enableSmsReminders: settings.enableSmsReminders,
      minBookingNoticeHours: settings.minBookingNoticeHours,
      maxBookingAdvanceDays: settings.maxBookingAdvanceDays,
      allowSameDayBooking: settings.allowSameDayBooking,
      cancellationPolicyHours: settings.cancellationPolicyHours,
      defaultTimezone: settings.defaultTimezone,
      notes: settings.notes,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }
}
