import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CitiesService, LocalitiesService } from './cities.service';

class CreateCityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  stateName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

class CreateLocalityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cityId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
}

@ApiTags('Cities & Localities')
@Controller()
export class CitiesController {
  constructor(
    private citiesService: CitiesService,
    private localitiesService: LocalitiesService,
  ) {}

  @Public()
  @Get('cities')
  @ApiOperation({ summary: 'List all cities' })
  async findAll() {
    return this.citiesService.findAll();
  }

  @Public()
  @Get('localities')
  @ApiOperation({ summary: 'List localities by city' })
  @ApiQuery({ name: 'cityId', required: true })
  async findByCity(@Query('cityId') cityId: string) {
    return this.localitiesService.findByCity(cityId);
  }

  // Admin-only and deliberately rare — see the comment on CitiesService.create.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('cities')
  @ApiOperation({ summary: 'Create a city (admin only)' })
  async create(@Body() dto: CreateCityDto) {
    return this.citiesService.create(dto.name, dto.stateName, dto.latitude, dto.longitude);
  }

  // Any authenticated builder can add a locality while creating a project —
  // get-or-create, no admin approval. See the comment on LocalitiesService.create.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUILDER)
  @Post('localities')
  @ApiOperation({ summary: 'Create a locality under a city (or return the existing one)' })
  async createLocality(@Body() dto: CreateLocalityDto) {
    return this.localitiesService.create(dto.cityId, dto.name);
  }
}
