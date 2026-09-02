import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CitiesService {
  private readonly logger = new Logger(CitiesService.name);
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.city.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    return this.prisma.city.findUnique({ where: { id }, include: { localities: true } });
  }

  async findBySlug(slug: string) {
    return this.prisma.city.findUnique({ where: { slug }, include: { localities: true } });
  }
}

@Injectable()
export class LocalitiesService {
  private readonly logger = new Logger(LocalitiesService.name);
  constructor(private prisma: PrismaService) {}

  async findByCity(cityId: string) {
    return this.prisma.locality.findMany({ where: { cityId }, orderBy: { name: 'asc' } });
  }
}
