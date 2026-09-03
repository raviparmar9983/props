import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ProjectHighlightsService } from './project-highlights.service';
import { CreateProjectHighlightDto, UpdateProjectHighlightDto } from './dto/project-highlight.dto';

@ApiTags('Project Highlights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller()
export class ProjectHighlightsController {
  constructor(private highlightsService: ProjectHighlightsService) {}

  @Post('projects/:projectId/highlights')
  @ApiOperation({ summary: 'Create highlight for project' })
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProjectHighlightDto,
  ) {
    return this.highlightsService.create(user.sub, projectId, dto);
  }

  @Get('projects/:projectId/highlights')
  @ApiOperation({ summary: 'List project highlights' })
  async listByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.highlightsService.listByProject(user.sub, projectId);
  }

  @Patch('highlights/:id')
  @ApiOperation({ summary: 'Update highlight' })
  async update(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProjectHighlightDto) {
    return this.highlightsService.update(user.sub, id, dto);
  }

  @Delete('highlights/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete highlight' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.highlightsService.delete(user.sub, id);
  }
}
