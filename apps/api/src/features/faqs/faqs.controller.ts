import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { FaqsService } from './faqs.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@ApiTags('Project FAQs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller()
export class FaqsController {
  constructor(private faqsService: FaqsService) {}

  @Post('projects/:projectId/faqs')
  @ApiOperation({ summary: 'Create FAQ for project' })
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFaqDto,
  ) {
    return this.faqsService.create(user.sub, projectId, dto);
  }

  @Get('projects/:projectId/faqs')
  @ApiOperation({ summary: 'List project FAQs' })
  async listByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.faqsService.listByProject(user.sub, projectId);
  }

  @Patch('faqs/:id')
  @ApiOperation({ summary: 'Update FAQ' })
  async update(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateFaqDto) {
    return this.faqsService.update(user.sub, id, dto);
  }

  @Delete('faqs/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete FAQ' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.faqsService.delete(user.sub, id);
  }
}
