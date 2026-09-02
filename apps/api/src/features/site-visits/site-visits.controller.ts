import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, SiteVisitStatus } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { SiteVisitsService } from './site-visits.service';
import { UpdateSiteVisitStatusDto } from './dto/site-visit.dto';

@ApiTags('Site Visits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller('site-visits')
export class SiteVisitsController {
  constructor(private siteVisitsService: SiteVisitsService) {}

  @Get()
  @ApiOperation({ summary: 'List site visit requests for my projects' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: SiteVisitStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('projectId') projectId?: string,
    @Query('status') status?: SiteVisitStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.siteVisitsService.listForBuilder(user.sub, {
      projectId,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update site visit request status' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateSiteVisitStatusDto,
  ) {
    return this.siteVisitsService.updateStatus(user.sub, id, dto);
  }
}
