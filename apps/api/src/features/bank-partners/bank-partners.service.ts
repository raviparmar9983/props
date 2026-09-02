import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectOwnershipService } from '../../prisma/project-ownership.service';
import { CreateBankPartnerDto, UpdateBankPartnerDto } from './dto/bank-partner.dto';

@Injectable()
export class BankPartnersService {
  private readonly logger = new Logger(BankPartnersService.name);
  constructor(
    private prisma: PrismaService,
    private ownership: ProjectOwnershipService,
  ) {}

  async create(builderUserId: string, projectId: string, dto: CreateBankPartnerDto) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.bankPartner.create({ data: { projectId, ...dto } });
  }

  async update(builderUserId: string, id: string, dto: UpdateBankPartnerDto) {
    await this.ownership.assertBankPartnerOwned(builderUserId, id);
    return this.prisma.bankPartner.update({ where: { id }, data: dto });
  }

  async delete(builderUserId: string, id: string) {
    await this.ownership.assertBankPartnerOwned(builderUserId, id);
    await this.prisma.bankPartner.delete({ where: { id } });
    return { message: 'Bank partner deleted' };
  }

  async listByProject(builderUserId: string, projectId: string) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.bankPartner.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
