import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectOwnershipService } from '../../prisma/project-ownership.service';
import { SiteVisitStatus } from '@prisma/client';
import { UpdateSiteVisitStatusDto } from './dto/site-visit.dto';

@Injectable()
export class SiteVisitsService {
  private readonly logger = new Logger(SiteVisitsService.name);
  constructor(
    private prisma: PrismaService,
    private ownership: ProjectOwnershipService,
  ) {}

  async listForBuilder(
    builderUserId: string,
    query: { projectId?: string; status?: SiteVisitStatus; page?: number; limit?: number },
  ) {
    const profile = await this.prisma.builderProfile.findUnique({ where: { userId: builderUserId } });
    if (!profile) throw new Error('Builder profile not found');

    const where: any = { project: { builderId: profile.id } };
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 50, 100);

    const [rows, total] = await Promise.all([
      this.prisma.siteVisitBooking.findMany({
        where,
        include: { project: { select: { id: true, title: true, slug: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { preferredDate: 'asc' },
      }),
      this.prisma.siteVisitBooking.count({ where }),
    ]);

    return { data: rows, meta: { total, page, limit } };
  }

  async updateStatus(builderUserId: string, id: string, dto: UpdateSiteVisitStatusDto) {
    await this.ownership.assertSiteVisitOwned(builderUserId, id);
    return this.prisma.siteVisitBooking.update({ where: { id }, data: { status: dto.status } });
  }
}
