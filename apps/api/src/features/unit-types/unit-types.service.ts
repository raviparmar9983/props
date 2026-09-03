import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectOwnershipService } from '../../prisma/project-ownership.service';
import { CreateUnitTypeDto, UpdateUnitTypeDto } from './dto/unit-type.dto';

@Injectable()
export class UnitTypesService {
  private readonly logger = new Logger(UnitTypesService.name);
  constructor(
    private prisma: PrismaService,
    private ownership: ProjectOwnershipService,
  ) {}

  async create(builderUserId: string, projectId: string, dto: CreateUnitTypeDto) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);

    if (dto.towerId) {
      const tower = await this.prisma.tower.findFirst({ where: { id: dto.towerId, projectId } });
      if (!tower) throw new NotFoundException('Tower not found in this project');
    }

    if (dto.availableCount > dto.totalCount) {
      throw new BadRequestException('availableCount cannot exceed totalCount');
    }

    return this.prisma.unitType.create({
      data: {
        projectId,
        towerId: dto.towerId,
        propertyType: dto.propertyType,
        label: dto.label,
        floorNumber: dto.floorNumber,
        facing: dto.facing,
        viewType: dto.viewType,
        carpetArea: dto.carpetArea,
        builtUpArea: dto.builtUpArea,
        areaUnit: dto.areaUnit,
        price: dto.price,
        priceUnit: dto.priceUnit,
        bookingAmount: dto.bookingAmount,
        parkingCount: dto.parkingCount,
        parkingType: dto.parkingType,
        totalCount: dto.totalCount,
        availableCount: dto.availableCount,
        attributes: dto.attributes,
      },
    });
  }

  async update(builderUserId: string, id: string, dto: UpdateUnitTypeDto) {
    await this.ownership.assertUnitTypeOwned(builderUserId, id);

    const existing = await this.prisma.unitType.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Unit type not found');

    const data: any = { ...dto };

    if (dto.totalCount !== undefined || dto.availableCount !== undefined) {
      const totalCount = dto.totalCount ?? existing.totalCount;
      const availableCount = dto.availableCount ?? existing.availableCount;
      if (availableCount > totalCount) {
        throw new BadRequestException('availableCount cannot exceed totalCount');
      }
    }

    if (dto.price !== undefined && dto.price !== Number(existing.price)) {
      await this.prisma.priceHistory.create({
        data: {
          unitTypeId: id,
          oldPrice: existing.price,
          newPrice: dto.price,
        },
      });
    }

    return this.prisma.unitType.update({ where: { id }, data });
  }

  async delete(builderUserId: string, id: string) {
    await this.ownership.assertUnitTypeOwned(builderUserId, id);

    const leadCount = await this.prisma.lead.count({ where: { unitTypeId: id } });
    if (leadCount > 0) {
      throw new ConflictException('Cannot delete unit type with leads attached to it');
    }

    await this.prisma.unitType.delete({ where: { id } });
    return { message: 'Unit type deleted' };
  }

  async listByProject(builderUserId: string, projectId: string) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.unitType.findMany({
      where: { projectId },
      include: { tower: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
