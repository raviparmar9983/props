import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, UpdateProjectAmenitiesDto } from './dto/project.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { UserRole, ProjectStatus } from '@prisma/client';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project (DRAFT)' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(user.sub, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List own projects' })
  async listMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: ProjectStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.listMine(user.sub, {
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project detail' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.projectsService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete project' })
  async softDelete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.projectsService.softDelete(user.sub, id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish project' })
  async publish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.projectsService.publish(user.sub, id);
  }

  @Patch(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish project back to DRAFT' })
  async unpublish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.projectsService.unpublish(user.sub, id);
  }

  @Put(':id/amenities')
  @ApiOperation({ summary: 'Replace amenities on a project' })
  async updateAmenities(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProjectAmenitiesDto,
  ) {
    return this.projectsService.updateAmenities(user.sub, id, dto.amenityIds);
  }
}
