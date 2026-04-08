import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientQueryDto,
  ClientResponseDto,
} from './dto';
import { Client, Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    tenantId: string,
    dto: CreateClientDto,
  ): Promise<ClientResponseDto> {
    // Check if client with email already exists in tenant
    const existing = await this.prisma.client.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email: dto.email,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Client with email "${dto.email}" already exists`,
      );
    }

    const data: Prisma.ClientCreateInput = {
      email: dto.email,
      name: dto.name,
      phone: dto.phone,
      notes: dto.notes,
      tenant: { connect: { id: tenantId } },
    };

    if (dto.userId) {
      data.user = { connect: { id: dto.userId } };
    }

    const created = await this.prisma.client.create({ data });
    return this.mapToDto(created);
  }

  async findAll(
    tenantId: string,
    query?: ClientQueryDto,
  ): Promise<ClientResponseDto[]> {
    const where: Prisma.ClientWhereInput = { tenantId };

    // Handle active filter
    if (query?.isActive !== undefined) {
      where.isActive = query.isActive;
    } else if (!query?.includeInactive) {
      where.isActive = true;
    }

    // Handle search
    if (query?.search) {
      const searchTerm = query.search.toLowerCase();
      where.OR = [
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { name: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const clients = await this.prisma.client.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return clients.map((c) => this.mapToDto(c));
  }

  async findOne(tenantId: string, id: string): Promise<ClientResponseDto> {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
      include: {
        appointments: {
          where: {
            status: { notIn: ['CANCELLED'] },
          },
          orderBy: { startsAt: 'desc' },
          take: 5,
          select: {
            id: true,
            startsAt: true,
            endsAt: true,
            status: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with id "${id}" not found`);
    }

    return this.mapToDto(client);
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    await this.findOne(tenantId, id); // Verify exists

    // Check email duplication
    if (dto.email) {
      const existing = await this.prisma.client.findFirst({
        where: {
          tenantId,
          email: dto.email,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Client with email "${dto.email}" already exists`,
        );
      }
    }

    const data: Prisma.ClientUpdateInput = {};

    if (dto.email !== undefined) data.email = dto.email;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const updated = await this.prisma.client.update({
      where: { id },
      data,
    });

    return this.mapToDto(updated);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);

    // Soft delete
    await this.prisma.client.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async hardDelete(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    await this.prisma.client.delete({ where: { id } });
  }

  async getClientByEmail(
    tenantId: string,
    email: string,
  ): Promise<ClientResponseDto | null> {
    const client = await this.prisma.client.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email,
        },
      },
    });

    return client ? this.mapToDto(client) : null;
  }

  async getClientAppointments(
    tenantId: string,
    clientId: string,
    limit: number = 10,
  ) {
    const client = await this.findOne(tenantId, clientId);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        clientId,
        tenantId,
      },
      orderBy: { startsAt: 'desc' },
      take: limit,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
          },
        },
      },
    });

    return {
      client,
      appointments,
    };
  }

  private mapToDto(
    client: Client & { appointments?: any[] },
  ): ClientResponseDto {
    return {
      id: client.id,
      tenantId: client.tenantId,
      userId: client.userId,
      email: client.email,
      name: client.name,
      phone: client.phone,
      notes: client.notes,
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
