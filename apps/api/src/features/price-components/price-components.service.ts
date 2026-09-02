import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectOwnershipService } from '../../prisma/project-ownership.service';
import { CreatePriceComponentDto, UpdatePriceComponentDto } from './dto/price-component.dto';

@Injectable()
export class PriceComponentsService {
  private readonly logger = new Logger(PriceComponentsService.name);
  constructor(
    private prisma: PrismaService,
    private ownership: ProjectOwnershipService,
  ) {}

  async create(builderUserId: string, projectId: string, dto: CreatePriceComponentDto) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.priceComponent.create({ data: { projectId, ...dto } });
  }

  async update(builderUserId: string, id: string, dto: UpdatePriceComponentDto) {
    await this.ownership.assertPriceComponentOwned(builderUserId, id);
    return this.prisma.priceComponent.update({ where: { id }, data: dto });
  }

  async delete(builderUserId: string, id: string) {
    await this.ownership.assertPriceComponentOwned(builderUserId, id);
    await this.prisma.priceComponent.delete({ where: { id } });
    return { message: 'Price component deleted' };
  }

  async listByProject(builderUserId: string, projectId: string) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.priceComponent.findMany({
      where: { projectId },
      orderBy: { displayOrder: 'asc' },
    });
  }
}
