import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectOwnershipService } from '../../prisma/project-ownership.service';
import { CreateSpecificationDto, UpdateSpecificationDto } from './dto/specification.dto';

@Injectable()
export class SpecificationsService {
  private readonly logger = new Logger(SpecificationsService.name);
  constructor(
    private prisma: PrismaService,
    private ownership: ProjectOwnershipService,
  ) {}

  async create(builderUserId: string, projectId: string, dto: CreateSpecificationDto) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.specificationItem.create({ data: { projectId, ...dto } });
  }

  async update(builderUserId: string, id: string, dto: UpdateSpecificationDto) {
    await this.ownership.assertSpecificationOwned(builderUserId, id);
    return this.prisma.specificationItem.update({ where: { id }, data: dto });
  }

  async delete(builderUserId: string, id: string) {
    await this.ownership.assertSpecificationOwned(builderUserId, id);
    await this.prisma.specificationItem.delete({ where: { id } });
    return { message: 'Specification deleted' };
  }

  async listByProject(builderUserId: string, projectId: string) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.specificationItem.findMany({
      where: { projectId },
      orderBy: { category: 'asc' },
    });
  }
}
