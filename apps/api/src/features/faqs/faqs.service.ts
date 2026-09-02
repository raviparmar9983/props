import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectOwnershipService } from '../../prisma/project-ownership.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@Injectable()
export class FaqsService {
  private readonly logger = new Logger(FaqsService.name);
  constructor(
    private prisma: PrismaService,
    private ownership: ProjectOwnershipService,
  ) {}

  async create(builderUserId: string, projectId: string, dto: CreateFaqDto) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.projectFAQ.create({ data: { projectId, ...dto } });
  }

  async update(builderUserId: string, id: string, dto: UpdateFaqDto) {
    await this.ownership.assertFaqOwned(builderUserId, id);
    return this.prisma.projectFAQ.update({ where: { id }, data: dto });
  }

  async delete(builderUserId: string, id: string) {
    await this.ownership.assertFaqOwned(builderUserId, id);
    await this.prisma.projectFAQ.delete({ where: { id } });
    return { message: 'FAQ deleted' };
  }

  async listByProject(builderUserId: string, projectId: string) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.projectFAQ.findMany({
      where: { projectId },
      orderBy: { displayOrder: 'asc' },
    });
  }
}
