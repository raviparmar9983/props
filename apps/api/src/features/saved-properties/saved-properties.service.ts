import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class SavedPropertiesService {
  private readonly logger = new Logger(SavedPropertiesService.name);
  constructor(private prisma: PrismaService) {}

  async save(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        status: { notIn: [ProjectStatus.DRAFT, ProjectStatus.ARCHIVED] },
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    const existing = await this.prisma.savedProperty.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (existing) return { message: 'Already saved' };

    await this.prisma.savedProperty.create({ data: { userId, projectId } });
    return { message: 'Property saved' };
  }

  async unsave(userId: string, projectId: string) {
    await this.prisma.savedProperty.deleteMany({ where: { userId, projectId } });
    return { message: 'Property unsaved' };
  }

  async listMine(userId: string) {
    const data = await this.prisma.savedProperty.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            city: true,
            locality: true,
            media: { where: { isPrimary: true }, take: 1 },
            unitTypes: { select: { price: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return {
      data,
      meta: { total: data.length, page: 1, limit: data.length },
    };
  }
}
