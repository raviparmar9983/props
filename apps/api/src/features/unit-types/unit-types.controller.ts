import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { UnitTypesService } from './unit-types.service';
import { CreateUnitTypeDto, UpdateUnitTypeDto } from './dto/unit-type.dto';

@ApiTags('Unit Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller()
export class UnitTypesController {
  constructor(private unitTypesService: UnitTypesService) {}

  @Post('projects/:projectId/unit-types')
  @ApiOperation({ summary: 'Create unit type in project' })
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateUnitTypeDto,
  ) {
    return this.unitTypesService.create(user.sub, projectId, dto);
  }

  @Get('projects/:projectId/unit-types')
  @ApiOperation({ summary: 'List unit types in project' })
  async listByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.unitTypesService.listByProject(user.sub, projectId);
  }

  @Patch('unit-types/:id')
  @ApiOperation({ summary: 'Update unit type' })
  async update(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateUnitTypeDto) {
    return this.unitTypesService.update(user.sub, id, dto);
  }

  @Delete('unit-types/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete unit type' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.unitTypesService.delete(user.sub, id);
  }
}
