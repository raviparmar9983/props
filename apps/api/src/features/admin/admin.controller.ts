import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { UserRole, ProjectStatus, ProjectVerificationStatus, ProjectReviewStatus } from '@prisma/client';
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class CreateAmenityDto {
  @ApiPropertyOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;
}

class RejectProjectDto {
  @ApiPropertyOptional()
  @IsString()
  reason: string;
}

class ReviewProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

class ReviewNoteDto {
  @ApiPropertyOptional()
  @IsString()
  notes: string;
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('builders')
  @ApiOperation({ summary: 'List builders (paginated, filterable)' })
  async listBuilders(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listBuilders({
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('builders/:id')
  @ApiOperation({ summary: 'Get builder detail with verification logs' })
  async getBuilder(@Param('id') id: string) {
    return this.adminService.getBuilder(id);
  }

  @Get('projects')
  @ApiOperation({ summary: 'List projects (paginated, filterable by verification/status)' })
  @ApiQuery({ name: 'verificationStatus', required: false, enum: ProjectVerificationStatus })
  @ApiQuery({ name: 'status', required: false, enum: ProjectStatus })
  async listProjects(
    @Query('verificationStatus') verificationStatus?: ProjectVerificationStatus,
    @Query('status') status?: ProjectStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listProjects({
      verificationStatus,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Patch('projects/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a submitted project (legacy builder verification)' })
  async approveProject(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.approveProjectReview(id, user.sub);
  }

  @Patch('projects/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a submitted project (legacy builder verification)' })
  async rejectProject(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RejectProjectDto,
  ) {
    return this.adminService.rejectProjectReview(id, user.sub, dto.reason);
  }

  // ── Review Queue ──────────────────────────────────────

  @Get('projects/review-queue')
  @ApiOperation({ summary: 'List projects pending review (default) or filter by reviewStatus' })
  @ApiQuery({ name: 'reviewStatus', required: false, enum: ProjectReviewStatus })
  async listReviewQueue(
    @Query('reviewStatus') reviewStatus?: ProjectReviewStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listReviewQueue({
      reviewStatus,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('projects/:id/review')
  @ApiOperation({ summary: 'Get project details for review (includes all data + review log)' })
  async getProjectForReview(@Param('id') id: string) {
    return this.adminService.getProjectForReview(id);
  }

  @Post('projects/:id/review/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a project listing (sets reviewStatus=APPROVED)' })
  async approveReview(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReviewProjectDto,
  ) {
    return this.adminService.approveProjectReview(id, user.sub, dto.notes);
  }

  @Post('projects/:id/review/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a project listing (requires reason)' })
  async rejectReview(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RejectProjectDto,
  ) {
    return this.adminService.rejectProjectReview(id, user.sub, dto.reason);
  }

  @Post('projects/:id/review/notes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add internal review note to a project' })
  async addReviewNote(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReviewNoteDto,
  ) {
    return this.adminService.addReviewNote(id, user.sub, dto.notes);
  }

  @Get('projects/:id/review/history')
  @ApiOperation({ summary: 'Get review audit trail for a project' })
  async getReviewHistory(@Param('id') id: string) {
    return this.adminService.getReviewHistory(id);
  }

  // ── Amenities ──────────────────────────────────────

  @Get('amenities')
  @ApiOperation({ summary: 'List all amenities' })
  async listAmenities() {
    return this.adminService.listAmenities();
  }

  @Post('amenities')
  @ApiOperation({ summary: 'Create an amenity' })
  async createAmenity(@Body() dto: CreateAmenityDto) {
    return this.adminService.createAmenity(dto.name, dto.icon);
  }

  @Delete('amenities/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an amenity' })
  async deleteAmenity(@Param('id') id: string) {
    return this.adminService.deleteAmenity(parseInt(id));
  }
}
