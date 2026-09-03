import { Module } from '@nestjs/common';
import { ProjectHighlightsController } from './project-highlights.controller';
import { ProjectHighlightsService } from './project-highlights.service';

@Module({
  controllers: [ProjectHighlightsController],
  providers: [ProjectHighlightsService],
  exports: [ProjectHighlightsService],
})
export class ProjectHighlightsModule {}
