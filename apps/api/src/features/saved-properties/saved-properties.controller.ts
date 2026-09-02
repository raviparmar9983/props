import { Controller, Get, Post, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SavedPropertiesService } from './saved-properties.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Saved Properties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@Controller('saved-properties')
export class SavedPropertiesController {
  constructor(private savedPropertiesService: SavedPropertiesService) {}

  @Post(':projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save a project' })
  async save(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
  ) {
    return this.savedPropertiesService.save(user.sub, projectId);
  }

  @Delete(':projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsave a project' })
  async unsave(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
  ) {
    return this.savedPropertiesService.unsave(user.sub, projectId);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List saved properties' })
  async listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.savedPropertiesService.listMine(user.sub);
  }
}
