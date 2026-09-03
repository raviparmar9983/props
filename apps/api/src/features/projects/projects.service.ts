import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { ProjectStatus, LitigationStatus } from '@prisma/client';
import { normalizePagination } from '../../common/utils/pagination';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async create(userId: string, dto: CreateProjectDto) {
    const profile = await this.prisma.builderProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Builder profile not found');

    const slug = await this.generateSlug(dto.title, dto.cityId);

    return this.prisma.project.create({
      data: {
        builderId: profile.id,
        cityId: dto.cityId,
        localityId: dto.localityId,
        title: dto.title,
        slug,
        description: dto.description,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        reraProjectNumber: dto.reraProjectNumber,
        possessionDate: dto.possessionDate ? new Date(dto.possessionDate) : null,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        ogImageUrl: dto.ogImageUrl,
        status: ProjectStatus.DRAFT,
      },
    });
  }

  async listMine(userId: string, query: { status?: ProjectStatus; page?: number; limit?: number }) {
    const profile = await this.prisma.builderProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Builder profile not found');

    const { page, limit } = normalizePagination(query.page, query.limit);
    const where: any = { builderId: profile.id, deletedAt: null };
    if (query.status) where.status = query.status;

    const [rows, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          city: true,
          locality: true,
          unitTypes: true,
          media: { where: { isPrimary: true }, take: 1 },
          _count: { select: { unitTypes: true, leads: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    const projects = await Promise.all(
      rows.map(async (p) => ({
        ...p,
        media: await Promise.all(
          p.media.map(async (m) => ({
            ...m,
            url: await this.storageService.resolvePublicUrl(m.url),
          })),
        ),
      })),
    );

    return { data: projects, meta: { total, page, limit } };
  }

  async findOne(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.builderId) {
      const profile = await this.prisma.builderProfile.findUnique({ where: { id: project.builderId } });
      if (!profile || profile.userId !== userId) throw new NotFoundException('Project not found');
    }
    return this.prisma.project
      .findUnique({
        where: { id: projectId },
        include: {
          city: true, locality: true, towers: true,
          unitTypes: true, media: { orderBy: { displayOrder: 'asc' } },
          amenities: { include: { amenity: true } },
          contacts: true,
          landmarks: { orderBy: { createdAt: 'asc' } },
          priceComponents: { orderBy: { createdAt: 'asc' } },
          paymentPlans: { orderBy: { createdAt: 'asc' } },
          bankPartners: { orderBy: { createdAt: 'asc' } },
          constructionUpdates: { orderBy: { createdAt: 'desc' } },
          specifications: { orderBy: { createdAt: 'asc' } },
          faqs: { orderBy: { createdAt: 'asc' } },
          highlights: { orderBy: { displayOrder: 'asc' } },
          siteVisits: { orderBy: { createdAt: 'desc' } },
          builder: true,
        },
      })
      .then(async (project) =>
        project
          ? {
              ...project,
              media: await Promise.all(
                project.media.map(async (m) => ({
                  ...m,
                  url: await this.storageService.resolvePublicUrl(m.url),
                })),
              ),
              ogImageUrl: await this.storageService.resolvePublicUrl(project.ogImageUrl),
            }
          : project,
      );
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    const project = await this.getOwnedProject(userId, projectId);
    const data: any = { ...dto };
    if (dto.possessionDate) data.possessionDate = new Date(dto.possessionDate);
    if (dto.title && dto.title !== project.title) {
      data.slug = await this.generateSlug(dto.title, project.cityId);
    }

    const litigationStatus = dto.litigationStatus ?? project.litigationStatus;
    const litigationDetails = dto.litigationDetails ?? project.litigationDetails;
    if (litigationStatus === LitigationStatus.PENDING && !litigationDetails) {
      throw new BadRequestException('litigationDetails is required when litigationStatus is PENDING');
    }
    if (litigationStatus === LitigationStatus.NONE) {
      data.litigationDetails = null;
    }

    return this.prisma.project.update({ where: { id: projectId }, data });
  }

  async softDelete(userId: string, projectId: string) {
    await this.getOwnedProject(userId, projectId);
    return this.prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });
  }

  async publish(userId: string, projectId: string) {
    const project = await this.getOwnedProject(userId, projectId);

    const [unitTypeCount, mediaCount] = await Promise.all([
      this.prisma.unitType.count({ where: { projectId } }),
      this.prisma.projectMedia.count({ where: { projectId, isPrimary: true } }),
    ]);

    const missing: string[] = [];
    if (unitTypeCount === 0) missing.push('at least 1 unit type');
    if (mediaCount === 0) missing.push('at least 1 primary media image');
    if (!project.localityId) missing.push('locality');
    if (missing.length > 0) {
      throw new BadRequestException(`Cannot publish: missing ${missing.join(', ')}`, 'PUBLISH_INCOMPLETE');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.UPCOMING,
        publishedAt: new Date(),
        reviewStatus: 'PENDING_REVIEW',
        verificationStatus: 'PENDING',
        rejectionReason: null,
        reviewedAt: null,
      },
    });
  }

  async unpublish(userId: string, projectId: string) {
    await this.getOwnedProject(userId, projectId);
    return this.prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.DRAFT, publishedAt: null },
    });
  }

  async updateAmenities(userId: string, projectId: string, amenityIds: number[]) {
    await this.getOwnedProject(userId, projectId);

    if (amenityIds.length === 0) {
      await this.prisma.projectAmenity.deleteMany({ where: { projectId } });
      return { message: 'Amenities updated', amenityIds: [] };
    }

    const validCount = await this.prisma.amenity.count({
      where: { id: { in: amenityIds } },
    });
    if (validCount !== amenityIds.length) {
      throw new BadRequestException('One or more amenity IDs are invalid');
    }

    await this.prisma.$transaction([
      this.prisma.projectAmenity.deleteMany({ where: { projectId } }),
      this.prisma.projectAmenity.createMany({
        data: amenityIds.map((amenityId) => ({ projectId, amenityId })),
      }),
    ]);

    return { message: 'Amenities updated', amenityIds };
  }

  private async getOwnedProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');
    const profile = await this.prisma.builderProfile.findUnique({ where: { id: project.builderId } });
    if (!profile || profile.userId !== userId) throw new NotFoundException('Project not found');
    return project;
  }

  private async generateSlug(title: string, cityId: string): Promise<string> {
    const city = await this.prisma.city.findUnique({ where: { id: cityId } });
    const base = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const citySlug = city?.slug ?? '';
    let slug = citySlug ? `${base}-${citySlug}` : base;
    let counter = 1;
    while (await this.prisma.project.findUnique({ where: { slug } })) {
      slug = `${base}-${citySlug ? citySlug + '-' : ''}${counter}`;
      counter++;
    }
    return slug;
  }
}
