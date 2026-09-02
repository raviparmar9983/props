import { Module } from '@nestjs/common';
import { CitiesController } from './cities.controller';
import { CitiesService, LocalitiesService } from './cities.service';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService, LocalitiesService],
  exports: [CitiesService, LocalitiesService],
})
export class CitiesModule {}
