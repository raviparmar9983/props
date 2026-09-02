import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectOwnershipService } from '../../prisma/project-ownership.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { CreateConstructionUpdateDto, UpdateConstructionUpdateDto } from './dto/construction-update.dto';

@Injectable()
export class ConstructionUpdatesService {
  private readonly logger = new Logger(ConstructionUpdatesService.name);
  constructor(
    private prisma: PrismaService,
    private ownership: ProjectOwnershipService,
    private storageService: StorageService,
  ) {}

  async create(
    builderUserId: string,
    projectId: string,
    dto: CreateConstructionUpdateDto,
    file?: Express.Multer.File,
  ) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);

    const data: any = {
      projectId,
      title: dto.title,
      description: dto.description,
      updateDate: new Date(dto.updateDate),
      progressPercent: dto.progressPercent,
    };
    if (dto.photoUrl) data.photoUrl = dto.photoUrl;
    if (file) {
      const result = await this.storageService.uploadFile(file, `projects/${projectId}/construction-updates`);
      data.photoUrl = result.url;
    }

    const row = await this.prisma.constructionUpdate.create({ data });
    return { ...row, photoUrl: await this.storageService.resolvePublicUrl(row.photoUrl) };
  }

  async update(
    builderUserId: string,
    id: string,
    dto: UpdateConstructionUpdateDto,
    file?: Express.Multer.File,
  ) {
    await this.ownership.assertConstructionUpdateOwned(builderUserId, id);

    const data: any = { ...dto };
    if (dto.updateDate) data.updateDate = new Date(dto.updateDate);
    if (file) {
      const result = await this.storageService.uploadFile(file, `construction-updates/${id}`);
      data.photoUrl = result.url;
    }

    const row = await this.prisma.constructionUpdate.update({ where: { id }, data });
    return { ...row, photoUrl: await this.storageService.resolvePublicUrl(row.photoUrl) };
  }

  async delete(builderUserId: string, id: string) {
    await this.ownership.assertConstructionUpdateOwned(builderUserId, id);

    const row = await this.prisma.constructionUpdate.findUnique({ where: { id } });
    if (row?.photoUrl) {
      const storageKey = this.storageService.deriveStorageKey(row.photoUrl);
      if (storageKey) {
        await this.storageService.deleteFile(storageKey);
      }
    }

    await this.prisma.constructionUpdate.delete({ where: { id } });
    return { message: 'Construction update deleted' };
  }

  async listByProject(builderUserId: string, projectId: string) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    const rows = await this.prisma.constructionUpdate.findMany({
      where: { projectId },
      orderBy: { updateDate: 'desc' },
    });
    return Promise.all(
      rows.map(async (row) => ({
        ...row,
        photoUrl: await this.storageService.resolvePublicUrl(row.photoUrl),
      })),
    );
  }
}
