import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ProjectOwnershipService {
  constructor(private prisma: PrismaService) {}

  async assertProjectOwned(builderUserId: string, projectId: string): Promise<{ id: string; builderId: string }> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, builder: { userId: builderUserId } },
      select: { id: true, builderId: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async assertTowerOwned(builderUserId: string, towerId: string): Promise<string> {
    const tower = await this.prisma.tower.findFirst({
      where: { id: towerId, project: { builder: { userId: builderUserId } } },
      select: { id: true },
    });
    if (!tower) throw new NotFoundException('Tower not found');
    return tower.id;
  }

  async assertUnitTypeOwned(builderUserId: string, unitTypeId: string): Promise<string> {
    const unitType = await this.prisma.unitType.findFirst({
      where: { id: unitTypeId, project: { builder: { userId: builderUserId } } },
      select: { id: true },
    });
    if (!unitType) throw new NotFoundException('Unit type not found');
    return unitType.id;
  }

  async assertMediaOwned(builderUserId: string, mediaId: string): Promise<string> {
    const media = await this.prisma.projectMedia.findFirst({
      where: { id: mediaId, project: { builder: { userId: builderUserId } } },
      select: { id: true },
    });
    if (!media) throw new NotFoundException('Media not found');
    return media.id;
  }

  async assertContactOwned(builderUserId: string, contactId: string): Promise<string> {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, project: { builder: { userId: builderUserId } } },
      select: { id: true },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact.id;
  }

  async assertLandmarkOwned(builderUserId: string, id: string): Promise<string> {
    return this.assertProjectChildOwned(builderUserId, 'nearbyLandmark', id, 'Landmark');
  }

  async assertPriceComponentOwned(builderUserId: string, id: string): Promise<string> {
    return this.assertProjectChildOwned(builderUserId, 'priceComponent', id, 'Price component');
  }

  async assertPaymentPlanOwned(builderUserId: string, id: string): Promise<string> {
    return this.assertProjectChildOwned(builderUserId, 'paymentPlan', id, 'Payment plan');
  }

  async assertBankPartnerOwned(builderUserId: string, id: string): Promise<string> {
    return this.assertProjectChildOwned(builderUserId, 'bankPartner', id, 'Bank partner');
  }

  async assertConstructionUpdateOwned(builderUserId: string, id: string): Promise<string> {
    return this.assertProjectChildOwned(builderUserId, 'constructionUpdate', id, 'Construction update');
  }

  async assertSpecificationOwned(builderUserId: string, id: string): Promise<string> {
    return this.assertProjectChildOwned(builderUserId, 'specificationItem', id, 'Specification');
  }

  async assertFaqOwned(builderUserId: string, id: string): Promise<string> {
    return this.assertProjectChildOwned(builderUserId, 'projectFAQ', id, 'FAQ');
  }

  async assertHighlightOwned(builderUserId: string, id: string): Promise<string> {
    return this.assertProjectChildOwned(builderUserId, 'projectHighlight', id, 'Highlight');
  }

  async assertSiteVisitOwned(builderUserId: string, id: string): Promise<string> {
    return this.assertProjectChildOwned(builderUserId, 'siteVisitBooking', id, 'Site visit');
  }

  private async assertProjectChildOwned(
    builderUserId: string,
    model: 'nearbyLandmark' | 'priceComponent' | 'paymentPlan' | 'bankPartner' | 'constructionUpdate' | 'specificationItem' | 'projectFAQ' | 'siteVisitBooking' | 'projectHighlight',
    id: string,
    label: string,
  ): Promise<string> {
    const record = await (this.prisma[model] as any).findFirst({
      where: { id, project: { builder: { userId: builderUserId } } },
      select: { id: true },
    });
    if (!record) throw new NotFoundException(`${label} not found`);
    return record.id;
  }
}
