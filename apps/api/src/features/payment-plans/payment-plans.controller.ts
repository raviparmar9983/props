import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaymentPlansService } from './payment-plans.service';
import { CreatePaymentPlanDto, UpdatePaymentPlanDto } from './dto/payment-plan.dto';

@ApiTags('Payment Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller()
export class PaymentPlansController {
  constructor(private paymentPlansService: PaymentPlansService) {}

  @Post('projects/:projectId/payment-plans')
  @ApiOperation({ summary: 'Create payment plan for project' })
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentPlanDto,
  ) {
    return this.paymentPlansService.create(user.sub, projectId, dto);
  }

  @Get('projects/:projectId/payment-plans')
  @ApiOperation({ summary: 'List project payment plans' })
  async listByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentPlansService.listByProject(user.sub, projectId);
  }

  @Patch('payment-plans/:id')
  @ApiOperation({ summary: 'Update payment plan' })
  async update(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePaymentPlanDto) {
    return this.paymentPlansService.update(user.sub, id, dto);
  }

  @Delete('payment-plans/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete payment plan' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentPlansService.delete(user.sub, id);
  }
}
