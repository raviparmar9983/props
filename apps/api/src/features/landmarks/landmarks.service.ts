import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectOwnershipService } from '../../prisma/project-ownership.service';
import { CreateLandmarkDto, UpdateLandmarkDto } from './dto/landmark.dto';

@Injectable()
export class LandmarksService {
  private readonly logger = new Logger(LandmarksService.name);
  constructor(
    private prisma: PrismaService,
    private ownership: ProjectOwnershipService,
  ) {}

  async create(builderUserId: string, projectId: string, dto: CreateLandmarkDto) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.nearbyLandmark.create({ data: { projectId, ...dto } });
  }

  async update(builderUserId: string, id: string, dto: UpdateLandmarkDto) {
    await this.ownership.assertLandmarkOwned(builderUserId, id);
    return this.prisma.nearbyLandmark.update({ where: { id }, data: dto });
  }

  async delete(builderUserId: string, id: string) {
    await this.ownership.assertLandmarkOwned(builderUserId, id);
    await this.prisma.nearbyLandmark.delete({ where: { id } });
    return { message: 'Landmark deleted' };
  }

  async listByProject(builderUserId: string, projectId: string) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.nearbyLandmark.findMany({
      where: { projectId },
      orderBy: { distanceKm: 'asc' },
    });
  }
}
