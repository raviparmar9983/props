import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectOwnershipService } from '../../prisma/project-ownership.service';
import { CreateProjectHighlightDto, UpdateProjectHighlightDto } from './dto/project-highlight.dto';

@Injectable()
export class ProjectHighlightsService {
  private readonly logger = new Logger(ProjectHighlightsService.name);
  constructor(
    private prisma: PrismaService,
    private ownership: ProjectOwnershipService,
  ) {}

  async create(builderUserId: string, projectId: string, dto: CreateProjectHighlightDto) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.projectHighlight.create({ data: { projectId, ...dto } });
  }

  async update(builderUserId: string, id: string, dto: UpdateProjectHighlightDto) {
    await this.ownership.assertHighlightOwned(builderUserId, id);
    return this.prisma.projectHighlight.update({ where: { id }, data: dto });
  }

  async delete(builderUserId: string, id: string) {
    await this.ownership.assertHighlightOwned(builderUserId, id);
    await this.prisma.projectHighlight.delete({ where: { id } });
    return { message: 'Highlight deleted' };
  }

  async listByProject(builderUserId: string, projectId: string) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.projectHighlight.findMany({
      where: { projectId },
      orderBy: { displayOrder: 'asc' },
    });
  }
}
