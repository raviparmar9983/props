import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AmenitiesService {
  private readonly logger = new Logger(AmenitiesService.name);
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.amenity.findMany({ orderBy: { name: 'asc' } });
  }

  async findByIds(ids: number[]) {
    return this.prisma.amenity.findMany({ where: { id: { in: ids } } });
  }
}
