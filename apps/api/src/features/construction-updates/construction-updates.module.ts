import { Module } from '@nestjs/common';
import { ConstructionUpdatesController } from './construction-updates.controller';
import { ConstructionUpdatesService } from './construction-updates.service';

@Module({
  controllers: [ConstructionUpdatesController],
  providers: [ConstructionUpdatesService],
  exports: [ConstructionUpdatesService],
})
export class ConstructionUpdatesModule {}
