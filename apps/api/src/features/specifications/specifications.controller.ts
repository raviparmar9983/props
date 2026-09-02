import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { SpecificationsService } from './specifications.service';
import { CreateSpecificationDto, UpdateSpecificationDto } from './dto/specification.dto';

@ApiTags('Specifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller()
export class SpecificationsController {
  constructor(private specificationsService: SpecificationsService) {}

  @Post('projects/:projectId/specifications')
  @ApiOperation({ summary: 'Create specification for project' })
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSpecificationDto,
  ) {
    return this.specificationsService.create(user.sub, projectId, dto);
  }

  @Get('projects/:projectId/specifications')
  @ApiOperation({ summary: 'List project specifications' })
  async listByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.specificationsService.listByProject(user.sub, projectId);
  }

  @Patch('specifications/:id')
  @ApiOperation({ summary: 'Update specification' })
  async update(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateSpecificationDto) {
    return this.specificationsService.update(user.sub, id, dto);
  }

  @Delete('specifications/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete specification' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.specificationsService.delete(user.sub, id);
  }
}
