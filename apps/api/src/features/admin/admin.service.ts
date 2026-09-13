import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { ProjectStatus, ProjectVerificationStatus, ProjectReviewStatus } from '@prisma/client';
import { normalizePagination } from '../../common/utils/pagination';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async listAmenities() {
    return this.prisma.amenity.findMany({ orderBy: { name: 'asc' } });
  }

  async createAmenity(name: string, icon?: string) {
    return this.prisma.amenity.create({ data: { name, icon } });
  }

  async deleteAmenity(id: number) {
    const projectCount = await this.prisma.projectAmenity.count({ where: { amenityId: id } });
    if (projectCount > 0) {
      throw new ConflictException('Cannot delete amenity that is assigned to projects');
    }
    await this.prisma.amenity.delete({ where: { id } });
    return { message: 'Amenity deleted' };
  }

  async listProjects(query: {
    verificationStatus?: ProjectVerificationStatus;
    status?: ProjectStatus;
    page?: number;
    limit?: number;
  }) {
    const { page, limit } = normalizePagination(query.page, query.limit, 50);
    const where: any = { deletedAt: null };
    if (query.verificationStatus) where.verificationStatus = query.verificationStatus;
    if (query.status) where.status = query.status;

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          builder: { select: { id: true, companyName: true } },
          city: { select: { id: true, name: true, slug: true } },
          locality: { select: { id: true, name: true } },
          media: { where: { isPrimary: true }, take: 1 },
          unitTypes: { select: { price: true } },
          _count: { select: { leads: true, unitTypes: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    const data = projects.map((p) => {
      const prices = p.unitTypes.map((u) => Number(u.price));
      return {
        ...p,
        media: p.media.map((m) => m.url),
        priceStartingFrom: prices.length > 0 ? Math.min(...prices) : null,
      };
    });

    return { data, meta: { total, page, limit } };
  }

  async listReviewQueue(query: {
    reviewStatus?: ProjectReviewStatus;
    page?: number;
    limit?: number;
  }) {
    const { page, limit } = normalizePagination(query.page, query.limit, 50);
    const where: any = { deletedAt: null };
    where.reviewStatus = query.reviewStatus ?? ProjectReviewStatus.PENDING_REVIEW;

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          builder: { select: { id: true, companyName: true, slug: true } },
          city: { select: { id: true, name: true } },
          locality: { select: { id: true, name: true } },
          media: { where: { isPrimary: true }, take: 1 },
          unitTypes: { select: { price: true } },
          _count: { select: { leads: true, unitTypes: true, media: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    const data = projects.map((p) => {
      const prices = p.unitTypes.map((u) => Number(u.price));
      return {
        ...p,
        media: p.media.map((m) => m.url),
        priceStartingFrom: prices.length > 0 ? Math.min(...prices) : null,
      };
    });

    return { data, meta: { total, page, limit } };
  }

  async getProjectForReview(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        builder: {
          select: {
            id: true, companyName: true, slug: true, logo: true,
            phone: true, reraNumber: true, gstNumber: true,
            verificationStatus: true, yearsInBusiness: true,
            totalProjectsCompleted: true, onTimeDeliveryRate: true,
          },
        },
        city: true,
        locality: true,
        towers: true,
        unitTypes: { include: { tower: true }, orderBy: { price: 'asc' } },
        media: { orderBy: { displayOrder: 'asc' } },
        amenities: { include: { amenity: true } },
        landmarks: { orderBy: { distanceKm: 'asc' } },
        priceComponents: { orderBy: { displayOrder: 'asc' } },
        paymentPlans: { orderBy: { createdAt: 'asc' } },
        bankPartners: { orderBy: { createdAt: 'asc' } },
        constructionUpdates: { orderBy: { updateDate: 'desc' } },
        specifications: { orderBy: { category: 'asc' } },
        contacts: true,
        reviewLogs: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async approveProjectReview(projectId: string, reviewedBy: string, notes?: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    if (project.reviewStatus !== ProjectReviewStatus.PENDING_REVIEW) {
      throw new ConflictException(`Project review status is ${project.reviewStatus}, not PENDING_REVIEW`);
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.project.update({
        where: { id: projectId },
        data: {
          reviewStatus: ProjectReviewStatus.APPROVED,
          verificationStatus: ProjectVerificationStatus.APPROVED,
          rejectionReason: null,
          reviewedAt: new Date(),
          reviewNotes: notes ?? project.reviewNotes,
        },
      }),
      this.prisma.projectReviewLog.create({
        data: {
          projectId,
          action: ProjectReviewStatus.APPROVED,
          notes,
          reviewedBy,
        },
      }),
    ]);

    await this.mailBuilder(
      project.builderId,
      'approved',
      project.title,
      '',
      '',
    );

    this.logger.log(`Project ${projectId} review approved by ${reviewedBy}`);
    return updated;
  }

  async rejectProjectReview(projectId: string, reviewedBy: string, reason: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    if (project.reviewStatus !== ProjectReviewStatus.PENDING_REVIEW) {
      throw new ConflictException(`Project review status is ${project.reviewStatus}, not PENDING_REVIEW`);
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.project.update({
        where: { id: projectId },
        data: {
          reviewStatus: ProjectReviewStatus.REJECTED,
          rejectionReason: reason,
          reviewedAt: new Date(),
        },
      }),
      this.prisma.projectReviewLog.create({
        data: {
          projectId,
          action: ProjectReviewStatus.REJECTED,
          reason,
          reviewedBy,
        },
      }),
    ]);

    await this.mailBuilder(project.builderId, 'rejected', project.title, '', '', reason);

    this.logger.log(`Project ${projectId} review rejected by ${reviewedBy}: ${reason}`);
    return updated;
  }

  async addReviewNote(projectId: string, reviewedBy: string, notes: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const [updated] = await this.prisma.$transaction([
      this.prisma.project.update({
        where: { id: projectId },
        data: { reviewNotes: notes },
      }),
      this.prisma.projectReviewLog.create({
        data: {
          projectId,
          action: project.reviewStatus,
          notes,
          reviewedBy,
        },
      }),
    ]);

    return updated;
  }

  async getReviewHistory(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.projectReviewLog.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async mailBuilder(
    builderId: string,
    action: 'approved' | 'rejected',
    projectTitle: string,
    city: string,
    locality: string,
    reason?: string,
  ) {
    const builder = await this.prisma.builderProfile.findUnique({ where: { id: builderId } });
    const user = builder?.userId
      ? await this.prisma.user.findUnique({ where: { id: builder.userId } })
      : null;
    if (!user?.email) return;

    if (action === 'approved') {
      await this.mailService.sendProjectApproved(user.email, projectTitle, city, locality);
    } else if (action === 'rejected' && reason) {
      await this.mailService.sendProjectRejected(user.email, projectTitle, reason);
    }
  }
}
