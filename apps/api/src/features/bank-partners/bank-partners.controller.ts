import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { BankPartnersService } from './bank-partners.service';
import { CreateBankPartnerDto, UpdateBankPartnerDto } from './dto/bank-partner.dto';

@ApiTags('Bank Partners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller()
export class BankPartnersController {
  constructor(private bankPartnersService: BankPartnersService) {}

  @Post('projects/:projectId/bank-partners')
  @ApiOperation({ summary: 'Create bank partner for project' })
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBankPartnerDto,
  ) {
    return this.bankPartnersService.create(user.sub, projectId, dto);
  }

  @Get('projects/:projectId/bank-partners')
  @ApiOperation({ summary: 'List project bank partners' })
  async listByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.bankPartnersService.listByProject(user.sub, projectId);
  }

  @Patch('bank-partners/:id')
  @ApiOperation({ summary: 'Update bank partner' })
  async update(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateBankPartnerDto) {
    return this.bankPartnersService.update(user.sub, id, dto);
  }

  @Delete('bank-partners/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete bank partner' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.bankPartnersService.delete(user.sub, id);
  }
}
