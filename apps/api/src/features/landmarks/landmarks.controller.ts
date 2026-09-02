import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { LandmarksService } from './landmarks.service';
import { CreateLandmarkDto, UpdateLandmarkDto } from './dto/landmark.dto';

@ApiTags('Landmarks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller()
export class LandmarksController {
  constructor(private landmarksService: LandmarksService) {}

  @Post('projects/:projectId/landmarks')
  @ApiOperation({ summary: 'Create landmark for project' })
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateLandmarkDto,
  ) {
    return this.landmarksService.create(user.sub, projectId, dto);
  }

  @Get('projects/:projectId/landmarks')
  @ApiOperation({ summary: 'List project landmarks' })
  async listByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.landmarksService.listByProject(user.sub, projectId);
  }

  @Patch('landmarks/:id')
  @ApiOperation({ summary: 'Update landmark' })
  async update(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateLandmarkDto) {
    return this.landmarksService.update(user.sub, id, dto);
  }

  @Delete('landmarks/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete landmark' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.landmarksService.delete(user.sub, id);
  }
}
