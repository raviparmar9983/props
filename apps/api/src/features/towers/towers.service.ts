import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectOwnershipService } from '../../prisma/project-ownership.service';

@Injectable()
export class TowersService {
  private readonly logger = new Logger(TowersService.name);
  constructor(
    private prisma: PrismaService,
    private ownership: ProjectOwnershipService,
  ) {}

  async create(builderUserId: string, projectId: string, name: string, totalFloors?: number) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.tower.create({ data: { projectId, name, totalFloors } });
  }

  async update(builderUserId: string, id: string, data: { name?: string; totalFloors?: number }) {
    await this.ownership.assertTowerOwned(builderUserId, id);
    return this.prisma.tower.update({ where: { id }, data });
  }

  async delete(builderUserId: string, id: string) {
    await this.ownership.assertTowerOwned(builderUserId, id);
    const unitTypeCount = await this.prisma.unitType.count({ where: { towerId: id } });
    if (unitTypeCount > 0) {
      throw new ConflictException('Cannot delete tower with unit types assigned to it');
    }
    await this.prisma.tower.delete({ where: { id } });
    return { message: 'Tower deleted' };
  }

  async listByProject(builderUserId: string, projectId: string) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.tower.findMany({ where: { projectId }, orderBy: { name: 'asc' } });
  }
}
