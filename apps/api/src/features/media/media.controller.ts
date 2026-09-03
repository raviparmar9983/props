import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UploadedFile, UseInterceptors, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, MediaType } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { MediaService } from './media.service';
import { IsOptional, IsString, IsInt, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ReorderItemDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsInt()
  displayOrder: number;
}

class ReorderMediaDto {
  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  order: ReorderItemDto[];
}

class UpdateMediaCaptionDto {
  @ApiPropertyOptional({ example: 'Clubhouse and pool deck, evening view', description: 'Caption / alt text used for accessibility and image SEO' })
  @IsOptional()
  @IsString()
  caption?: string | null;
}

@ApiTags('Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller()
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('projects/:projectId/media')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      file: { type: 'string', format: 'binary' },
      type: { type: 'string', enum: Object.values(MediaType) },
    },
    required: ['file', 'type'],
  }})
  @ApiQuery({ name: 'type', enum: Object.values(MediaType) })
  @ApiQuery({ name: 'unitTypeId', required: false })
  @ApiQuery({ name: 'caption', required: false, description: 'Caption / alt text used for accessibility and image SEO' })
  @ApiOperation({ summary: 'Upload media to project' })
  async upload(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type?: MediaType,
    @Query('unitTypeId') unitTypeId?: string,
    @Query('caption') caption?: string,
  ) {
    if (!type) throw new BadRequestException('Missing or invalid media type');
    return this.mediaService.upload(user.sub, projectId, file, type, unitTypeId, caption);
  }

  @Delete('media/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete media' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.mediaService.delete(user.sub, id);
  }

  @Patch('projects/:projectId/media/reorder')
  @ApiOperation({ summary: 'Reorder project media' })
  async reorder(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderMediaDto,
  ) {
    return this.mediaService.reorder(user.sub, projectId, dto.order);
  }

  @Patch('projects/:projectId/media/:mediaId/primary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set media as primary' })
  async setPrimary(
    @Param('projectId') projectId: string,
    @Param('mediaId') mediaId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mediaService.setPrimary(user.sub, projectId, mediaId);
  }

  @Get('projects/:projectId/media')
  @ApiOperation({ summary: 'List project media' })
  async listByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.mediaService.listByProject(user.sub, projectId);
  }

  @Patch('media/:id/caption')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set/update media caption (alt text)' })
  async updateCaption(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateMediaCaptionDto,
  ) {
    return this.mediaService.updateCaption(user.sub, id, dto.caption ?? null);
  }
}
