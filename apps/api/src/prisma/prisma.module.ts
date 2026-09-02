import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ProjectOwnershipService } from './project-ownership.service';

@Global()
@Module({
  providers: [PrismaService, ProjectOwnershipService],
  exports: [PrismaService, ProjectOwnershipService],
})
export class PrismaModule {}
