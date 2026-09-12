import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { UserRole, LeadStatus } from '@prisma/client';
import { IsString, IsOptional, IsEnum, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateLeadDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unitTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Name provided by the customer for this enquiry' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  contactName?: string;

  @ApiPropertyOptional({ description: 'Phone number provided by the customer for this enquiry' })
  @IsOptional()
  @IsString()
  @Matches(/^[+()\-\s0-9]{7,24}$/)
  contactPhone?: string;
}

class UpdateLeadStatusDto {
  @ApiProperty({ enum: LeadStatus })
  @IsEnum(LeadStatus)
  status: LeadStatus;
}

class AssignLeadDto {
  @ApiPropertyOptional({ description: 'Id of the builder Contact handling this lead; omit/null to unassign', nullable: true })
  @IsOptional()
  @IsString()
  contactId?: string | null;
}

@ApiTags('Leads')
@Controller()
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post('public/leads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit lead (customer, must be logged in)' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateLeadDto,
  ) {
    return this.leadsService.create(user.sub, dto);
  }

  @Get('leads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUILDER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List own leads (builder)' })
  async listForBuilder(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: LeadStatus,
    @Query('projectId') projectId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leadsService.listForBuilder(user.sub, {
      status, projectId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('leads/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUILDER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lead detail (builder)' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.leadsService.findOne(user.sub, id);
  }

  @Patch('leads/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUILDER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update lead status (builder)' })
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
  ) {
    return this.leadsService.updateStatus(user.sub, id, dto.status);
  }

  @Patch('leads/:id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUILDER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign a lead to a builder contact (or unassign with contactId: null)' })
  async assignContact(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AssignLeadDto,
  ) {
    return this.leadsService.assignContact(user.sub, id, dto.contactId ?? null);
  }
}
