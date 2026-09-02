import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectOwnershipService } from '../../prisma/project-ownership.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { MediaType } from '@prisma/client';
import { assertFileMatchesType } from '../../common/utils/file-validation';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private prisma: PrismaService,
    private ownership: ProjectOwnershipService,
    private storageService: StorageService,
  ) {}

  async upload(
    builderUserId: string,
    projectId: string,
    file: Express.Multer.File,
    type: MediaType,
    unitTypeId?: string,
  ) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);

    if (!Object.values(MediaType).includes(type)) {
      throw new BadRequestException(`Unsupported media type: ${String(type)}`);
    }
    assertFileMatchesType(type, file);

    if (unitTypeId) {
      const unit = await this.prisma.unitType.findFirst({
        where: { id: unitTypeId, projectId },
        select: { id: true },
      });
      if (!unit) throw new BadRequestException('unitTypeId does not belong to this project');
    }

    const result = await this.storageService.uploadFile(file, `projects/${projectId}/media`);

    const maxOrder = await this.prisma.projectMedia.findFirst({
      where: { projectId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });

    const media = await this.prisma.projectMedia.create({
      data: {
        projectId,
        type,
        url: result.url,
        displayOrder: (maxOrder?.displayOrder ?? -1) + 1,
        isPrimary: false,
        unitTypeId: unitTypeId ?? null,
      },
    });

    return { ...media, url: await this.storageService.resolvePublicUrl(media.url) };
  }

  async delete(builderUserId: string, mediaId: string) {
    await this.ownership.assertMediaOwned(builderUserId, mediaId);

    const media = await this.prisma.projectMedia.findUnique({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media not found');

    await this.prisma.projectMedia.delete({ where: { id: mediaId } });
    if (media.url) {
      const storageKey = this.storageService.deriveStorageKey(media.url);
      if (storageKey) {
        await this.storageService.deleteFile(storageKey);
      }
    }
    return { message: 'Media deleted' };
  }

  async reorder(builderUserId: string, projectId: string, items: Array<{ id: string; displayOrder: number }>) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);

    const updates = items.map((item) =>
      this.prisma.projectMedia.updateMany({
        where: { id: item.id, projectId },
        data: { displayOrder: item.displayOrder },
      }),
    );
    await this.prisma.$transaction(updates);
    return { message: 'Reordered' };
  }

  async setPrimary(builderUserId: string, projectId: string, mediaId: string) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);

    const media = await this.prisma.projectMedia.findFirst({
      where: { id: mediaId, projectId },
      select: { id: true },
    });
    if (!media) throw new NotFoundException('Media not found in this project');

    await this.prisma.$transaction([
      this.prisma.projectMedia.updateMany({
        where: { projectId },
        data: { isPrimary: false },
      }),
      this.prisma.projectMedia.update({
        where: { id: mediaId },
        data: { isPrimary: true },
      }),
    ]);
    return { message: 'Primary media set' };
  }

  async listByProject(builderUserId: string, projectId: string) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    const rows = await this.prisma.projectMedia.findMany({
      where: { projectId },
      orderBy: { displayOrder: 'asc' },
    });
    return Promise.all(
      rows.map(async (row) => ({
        ...row,
        url: await this.storageService.resolvePublicUrl(row.url),
      })),
    );
  }
}
