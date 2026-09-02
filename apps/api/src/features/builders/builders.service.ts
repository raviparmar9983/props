import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateBuilderDto } from './dto/update-builder.dto';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto/portfolio.dto';

@Injectable()
export class BuildersService {
  private readonly logger = new Logger(BuildersService.name);

  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.builderProfile.findUnique({
      where: { userId },
      include: { city: true },
    });
    if (!profile) throw new NotFoundException('Builder profile not found');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateBuilderDto) {
    const profile = await this.prisma.builderProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Builder profile not found');

    const updates: any = {};

    if (dto.companyName !== undefined) updates.companyName = dto.companyName;
    if (dto.phone !== undefined) updates.phone = dto.phone;
    if (dto.logo !== undefined) updates.logo = dto.logo || null;
    if (dto.yearsInBusiness !== undefined) updates.yearsInBusiness = dto.yearsInBusiness;
    if (dto.totalProjectsCompleted !== undefined) updates.totalProjectsCompleted = dto.totalProjectsCompleted;
    if (dto.onTimeDeliveryRate !== undefined) updates.onTimeDeliveryRate = dto.onTimeDeliveryRate;
    if (dto.reraNumber !== undefined) updates.reraNumber = dto.reraNumber;
    if (dto.gstNumber !== undefined) updates.gstNumber = dto.gstNumber;

    return this.prisma.builderProfile.update({
      where: { id: profile.id },
      data: updates,
      include: { city: true },
    });
  }

  async uploadDocuments(userId: string, docs: Array<{ type: string; url: string }>) {
    const profile = await this.prisma.builderProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Builder profile not found');

    const existingDocs = (profile.verificationDocs as any[]) || [];
    const updatedDocs = [...existingDocs, ...docs];

    return this.prisma.builderProfile.update({
      where: { id: profile.id },
      data: { verificationDocs: updatedDocs },
    });
  }

  async listPortfolio(userId: string) {
    const profile = await this.getProfileOrThrow(userId);
    return this.prisma.builderPortfolioProject.findMany({
      where: { builderId: profile.id },
      orderBy: { completionYear: 'desc' },
    });
  }

  async createPortfolio(userId: string, dto: CreatePortfolioDto) {
    const profile = await this.getProfileOrThrow(userId);
    return this.prisma.builderPortfolioProject.create({
      data: { builderId: profile.id, ...dto },
    });
  }

  async updatePortfolio(userId: string, id: string, dto: UpdatePortfolioDto) {
    const profile = await this.getProfileOrThrow(userId);
    const existing = await this.prisma.builderPortfolioProject.findFirst({
      where: { id, builderId: profile.id },
    });
    if (!existing) throw new NotFoundException('Portfolio project not found');
    return this.prisma.builderPortfolioProject.update({ where: { id }, data: dto });
  }

  async deletePortfolio(userId: string, id: string) {
    const profile = await this.getProfileOrThrow(userId);
    const existing = await this.prisma.builderPortfolioProject.findFirst({
      where: { id, builderId: profile.id },
    });
    if (!existing) throw new NotFoundException('Portfolio project not found');
    await this.prisma.builderPortfolioProject.delete({ where: { id } });
    return { message: 'Portfolio project deleted' };
  }

  async listReviews(userId: string) {
    const profile = await this.getProfileOrThrow(userId);
    return this.prisma.builderReview.findMany({
      where: { builderId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getProfileOrThrow(userId: string) {
    const profile = await this.prisma.builderProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Builder profile not found');
    return profile;
  }
}
