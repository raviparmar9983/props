import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { AmenitiesService } from './amenities.service';

@ApiTags('Amenities')
@Controller('amenities')
export class AmenitiesController {
  constructor(private amenitiesService: AmenitiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all amenities' })
  async findAll() {
    return this.amenitiesService.findAll();
  }
}
