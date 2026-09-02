import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { TowersService } from './towers.service';
import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateTowerDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  totalFloors?: number;
}

@ApiTags('Towers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller()
export class TowersController {
  constructor(private towersService: TowersService) {}

  @Post('projects/:projectId/towers')
  @ApiOperation({ summary: 'Create tower in project' })
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTowerDto,
  ) {
    return this.towersService.create(user.sub, projectId, dto.name, dto.totalFloors);
  }

  @Get('projects/:projectId/towers')
  @ApiOperation({ summary: 'List towers in project' })
  async listByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.towersService.listByProject(user.sub, projectId);
  }

  @Patch('towers/:id')
  @ApiOperation({ summary: 'Update tower' })
  async update(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTowerDto) {
    return this.towersService.update(user.sub, id, dto);
  }

  @Delete('towers/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete tower' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.towersService.delete(user.sub, id);
  }
}
