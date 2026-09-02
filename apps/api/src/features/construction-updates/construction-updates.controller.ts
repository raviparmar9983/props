import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards,
  HttpCode, HttpStatus, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ConstructionUpdatesService } from './construction-updates.service';
import { CreateConstructionUpdateDto, UpdateConstructionUpdateDto } from './dto/construction-update.dto';

@ApiTags('Construction Updates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller()
export class ConstructionUpdatesController {
  constructor(private constructionUpdatesService: ConstructionUpdatesService) {}

  @Post('projects/:projectId/construction-updates')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        description: { type: 'string' },
        updateDate: { type: 'string', format: 'date' },
        progressPercent: { type: 'number' },
      },
      required: ['title', 'updateDate'],
    },
  })
  @ApiOperation({ summary: 'Create construction update for project (optional photo)' })
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateConstructionUpdateDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.constructionUpdatesService.create(user.sub, projectId, dto, file);
  }

  @Get('projects/:projectId/construction-updates')
  @ApiOperation({ summary: 'List project construction updates' })
  async listByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.constructionUpdatesService.listByProject(user.sub, projectId);
  }

  @Patch('construction-updates/:id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update construction update (optional photo)' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateConstructionUpdateDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.constructionUpdatesService.update(user.sub, id, dto, file);
  }

  @Delete('construction-updates/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete construction update' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.constructionUpdatesService.delete(user.sub, id);
  }
}
