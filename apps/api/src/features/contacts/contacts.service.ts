import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectOwnershipService } from '../../prisma/project-ownership.service';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);
  constructor(
    private prisma: PrismaService,
    private ownership: ProjectOwnershipService,
  ) {}

  async create(builderUserId: string, projectId: string, data: {
    name: string;
    phone: string;
    designation?: string;
    email?: string;
    isPrimary?: boolean;
  }) {
    const project = await this.ownership.assertProjectOwned(builderUserId, projectId);

    if (data.isPrimary) {
      await this.prisma.contact.updateMany({
        where: { projectId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.contact.create({
      data: {
        builderId: project.builderId,
        projectId,
        name: data.name,
        phone: data.phone,
        designation: data.designation,
        email: data.email,
        isPrimary: data.isPrimary ?? false,
      },
    });
  }

  async update(builderUserId: string, id: string, data: {
    name?: string;
    phone?: string;
    designation?: string;
    email?: string;
    isPrimary?: boolean;
  }) {
    await this.ownership.assertContactOwned(builderUserId, id);

    const existing = await this.prisma.contact.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Contact not found');

    if (data.isPrimary && existing.projectId) {
      await this.prisma.contact.updateMany({
        where: { projectId: existing.projectId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.contact.update({ where: { id }, data });
  }

  async delete(builderUserId: string, id: string) {
    await this.ownership.assertContactOwned(builderUserId, id);
    await this.prisma.contact.delete({ where: { id } });
    return { message: 'Contact deleted' };
  }

  async listByProject(builderUserId: string, projectId: string) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.contact.findMany({
      where: { projectId },
      orderBy: { isPrimary: 'desc' },
    });
  }
}
