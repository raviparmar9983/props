import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CitiesService, LocalitiesService } from './cities.service';

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
}
