import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectOwnershipService } from '../../prisma/project-ownership.service';
import { CreatePaymentPlanDto, UpdatePaymentPlanDto } from './dto/payment-plan.dto';

@Injectable()
export class PaymentPlansService {
  private readonly logger = new Logger(PaymentPlansService.name);
  constructor(
    private prisma: PrismaService,
    private ownership: ProjectOwnershipService,
  ) {}

  async create(builderUserId: string, projectId: string, dto: CreatePaymentPlanDto) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.paymentPlan.create({ data: { projectId, ...dto } });
  }

  async update(builderUserId: string, id: string, dto: UpdatePaymentPlanDto) {
    await this.ownership.assertPaymentPlanOwned(builderUserId, id);
    return this.prisma.paymentPlan.update({ where: { id }, data: dto });
  }

  async delete(builderUserId: string, id: string) {
    await this.ownership.assertPaymentPlanOwned(builderUserId, id);
    await this.prisma.paymentPlan.delete({ where: { id } });
    return { message: 'Payment plan deleted' };
  }

  async listByProject(builderUserId: string, projectId: string) {
    await this.ownership.assertProjectOwned(builderUserId, projectId);
    return this.prisma.paymentPlan.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
