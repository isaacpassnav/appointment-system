import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceQueryDto,
  ServiceResponseDto,
} from './dto';
import { Service, Prisma } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToResponseDto(service: Service): ServiceResponseDto {
    return {
      ...service,
      price: service.price ? service.price.toNumber() : null,
    };
  }

  async create(
    tenantId: string,
    dto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    // Verificar si ya existe un servicio con el mismo nombre en el tenant
    const existing = await this.prisma.service.findFirst({
      where: {
        tenantId,
        name: { equals: dto.name, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new ConflictException(`Service "${dto.name}" already exists`);
    }

    const data: Prisma.ServiceCreateInput = {
      name: dto.name,
      description: dto.description,
      duration: dto.duration,
      price:
        dto.price !== undefined ? new Prisma.Decimal(dto.price) : undefined,
      color: dto.color,
      tenant: { connect: { id: tenantId } },
    };

    const created = await this.prisma.service.create({ data });
    return this.mapToResponseDto(created);
  }

  async findAll(
    tenantId: string,
    query?: ServiceQueryDto,
  ): Promise<ServiceResponseDto[]> {
    const where: Prisma.ServiceWhereInput = { tenantId };

    if (query?.isActive !== undefined) {
      where.isActive = query.isActive;
    } else if (!query?.includeInactive) {
      // Por defecto solo mostrar activos
      where.isActive = true;
    }

    const services = await this.prisma.service.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return services.map((s) => this.mapToResponseDto(s));
  }

  async findOne(tenantId: string, id: string): Promise<ServiceResponseDto> {
    const service = await this.prisma.service.findFirst({
      where: { id, tenantId },
    });

    if (!service) {
      throw new NotFoundException(`Service with id "${id}" not found`);
    }

    return this.mapToResponseDto(service);
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    await this.findOne(tenantId, id); // Verificar que existe

    // Verificar nombre duplicado si se está actualizando
    if (dto.name) {
      const existing = await this.prisma.service.findFirst({
        where: {
          tenantId,
          name: { equals: dto.name, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(`Service "${dto.name}" already exists`);
      }
    }

    const data: Prisma.ServiceUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.duration !== undefined) data.duration = dto.duration;
    if (dto.price !== undefined) data.price = new Prisma.Decimal(dto.price);
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const updated = await this.prisma.service.update({
      where: { id },
      data,
    });
    return this.mapToResponseDto(updated);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);

    // Soft delete: marcar como inactivo en lugar de eliminar
    // Esto preserva el historial de citas asociadas
    await this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async hardDelete(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    await this.prisma.service.delete({ where: { id } });
  }
}
