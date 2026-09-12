import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { LeadStatus } from '@prisma/client';
import { normalizePagination } from '../../common/utils/pagination';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(customerId: string, dto: {
    projectId: string;
    unitTypeId?: string;
    message?: string;
    contactName?: string;
    contactPhone?: string;
  }) {
    const [project, customer] = await Promise.all([
      this.prisma.project.findUnique({ where: { id: dto.projectId } }),
      this.prisma.user.findUnique({ where: { id: customerId } }),
    ]);
    if (!project) throw new NotFoundException('Project not found');

    // Duplicate prevention: check for recent NEW/CONTACTED lead from same customer
    const recentLead = await this.prisma.lead.findFirst({
      where: {
        customerId,
        projectId: dto.projectId,
        status: { in: [LeadStatus.NEW, LeadStatus.CONTACTED] },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (recentLead) {
      return { ...recentLead, duplicate: true };
    }

    const lead = await this.prisma.lead.create({
      data: {
        projectId: dto.projectId,
        builderId: project.builderId,
        customerId,
        unitTypeId: dto.unitTypeId,
        message: dto.message,
        contactName: dto.contactName?.trim() || null,
        contactPhone: dto.contactPhone?.trim() || null,
        status: LeadStatus.NEW,
      },
    });

    // Notify builder
    const builderProfile = await this.prisma.builderProfile.findUnique({ where: { id: project.builderId } });
    if (builderProfile?.userId) {
      await this.prisma.notification.create({
        data: {
          userId: builderProfile.userId,
          type: 'NEW_LEAD',
          title: 'New Lead Received',
          body: `A new lead has been submitted for project: ${project.title} on VerifiedProps.`,
          relatedEntityType: 'Lead',
          relatedEntityId: lead.id,
        },
      });
    }

    // Notify builder via email — fire-and-forget, never block the response
    if (builderProfile) {
      // Prefer project-specific primary contact, fall back to builder user email
      const primaryContact = await this.prisma.contact.findFirst({
        where: { projectId: dto.projectId, isPrimary: true },
      });
      const recipientEmail = primaryContact?.email || (await this.prisma.user.findUnique({ where: { id: builderProfile.userId } }))?.email;

      if (recipientEmail && customer) {
        const leadId = lead.id;
        const timestamp = lead.createdAt.toISOString();
        this.mailService.sendNewLead(
          recipientEmail,
          project.title,
          lead.contactName ?? customer.email.split("@")[0] ?? customer.email,
          customer.email,
          lead.contactPhone ?? customer.phone ?? undefined,
          dto.message ?? "General inquiry",
          leadId,
          timestamp,
        ).catch((err) => this.logger.error(`Failed to send lead email for lead ${leadId}`, err));
      }
    }

    return { id: lead.id, status: lead.status, createdAt: lead.createdAt };
  }

  async listForBuilder(builderUserId: string, query: {
    status?: LeadStatus;
    projectId?: string;
    page?: number;
    limit?: number;
  }) {
    const profile = await this.prisma.builderProfile.findUnique({ where: { userId: builderUserId } });
    if (!profile) throw new NotFoundException('Builder profile not found');

    const { page, limit } = normalizePagination(query.page, query.limit);
    const where: any = { builderId: profile.id };
    if (query.status) where.status = query.status;
    if (query.projectId) where.projectId = query.projectId;

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: { project: true, unitType: true, customer: { select: { id: true, email: true } }, assignedContact: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { data: leads, meta: { total, page, limit } };
  }

  async findOne(builderUserId: string, leadId: string) {
    const profile = await this.prisma.builderProfile.findUnique({ where: { userId: builderUserId } });
    if (!profile) throw new NotFoundException('Builder profile not found');

    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, builderId: profile.id },
      include: { project: true, unitType: true, customer: { select: { id: true, email: true } }, assignedContact: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async updateStatus(builderUserId: string, leadId: string, status: LeadStatus) {
    const profile = await this.prisma.builderProfile.findUnique({ where: { userId: builderUserId } });
    if (!profile) throw new NotFoundException('Builder profile not found');

    const lead = await this.prisma.lead.findFirst({ where: { id: leadId, builderId: profile.id } });
    if (!lead) throw new NotFoundException('Lead not found');

    const data: any = { status };
    if (status === LeadStatus.CONTACTED && !lead.contactedAt) {
      data.contactedAt = new Date();
    }

    return this.prisma.lead.update({ where: { id: leadId }, data });
  }

  async assignContact(builderUserId: string, leadId: string, contactId: string | null) {
    const profile = await this.prisma.builderProfile.findUnique({ where: { userId: builderUserId } });
    if (!profile) throw new NotFoundException('Builder profile not found');

    const lead = await this.prisma.lead.findFirst({ where: { id: leadId, builderId: profile.id } });
    if (!lead) throw new NotFoundException('Lead not found');

    if (contactId) {
      const contact = await this.prisma.contact.findFirst({ where: { id: contactId, builderId: profile.id } });
      if (!contact) throw new NotFoundException('Contact not found for this builder');
    }

    return this.prisma.lead.update({
      where: { id: leadId },
      data: { assignedContactId: contactId },
      include: { assignedContact: true },
    });
  }
}
