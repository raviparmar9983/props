import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ContactsService } from './contacts.service';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateContactDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

@ApiTags('Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller()
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post('projects/:projectId/contacts')
  @ApiOperation({ summary: 'Add contact to project' })
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactsService.create(user.sub, projectId, dto);
  }

  @Get('projects/:projectId/contacts')
  @ApiOperation({ summary: 'List project contacts' })
  async listByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.contactsService.listByProject(user.sub, projectId);
  }

  @Patch('contacts/:id')
  @ApiOperation({ summary: 'Update contact' })
  async update(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: CreateContactDto) {
    return this.contactsService.update(user.sub, id, dto);
  }

  @Delete('contacts/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete contact' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.contactsService.delete(user.sub, id);
  }
}
