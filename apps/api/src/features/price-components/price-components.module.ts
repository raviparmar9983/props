import { Module } from '@nestjs/common';
import { PriceComponentsController } from './price-components.controller';
import { PriceComponentsService } from './price-components.service';

@Module({
  controllers: [PriceComponentsController],
  providers: [PriceComponentsService],
  exports: [PriceComponentsService],
})
export class PriceComponentsModule {}
