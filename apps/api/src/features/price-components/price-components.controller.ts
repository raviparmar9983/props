import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PriceComponentsService } from './price-components.service';
import { CreatePriceComponentDto, UpdatePriceComponentDto } from './dto/price-component.dto';

@ApiTags('Price Components')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller()
export class PriceComponentsController {
  constructor(private priceComponentsService: PriceComponentsService) {}

  @Post('projects/:projectId/price-components')
  @ApiOperation({ summary: 'Create price component for project' })
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePriceComponentDto,
  ) {
    return this.priceComponentsService.create(user.sub, projectId, dto);
  }

  @Get('projects/:projectId/price-components')
  @ApiOperation({ summary: 'List project price components' })
  async listByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.priceComponentsService.listByProject(user.sub, projectId);
  }

  @Patch('price-components/:id')
  @ApiOperation({ summary: 'Update price component' })
  async update(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePriceComponentDto) {
    return this.priceComponentsService.update(user.sub, id, dto);
  }

  @Delete('price-components/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete price component' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.priceComponentsService.delete(user.sub, id);
  }
}
