import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import slugify from 'slugify';
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

  // Cities are deliberately rare and admin-only (each one implies new SEO
  // landing pages / market entry), unlike localities which builders create
  // freely — see LocalitiesService.create below.
  async create(name: string, stateName: string, latitude?: number, longitude?: number) {
    const trimmedName = name.trim().replace(/\s+/g, ' ');
    const slug = slugify(trimmedName, { lower: true, strict: true });
    const existing = await this.prisma.city.findUnique({ where: { slug } });
    if (existing) return existing;
    return this.prisma.city.create({
      data: { name: trimmedName, slug, stateName: stateName.trim(), latitude, longitude },
    });
  }
}

@Injectable()
export class LocalitiesService {
  private readonly logger = new Logger(LocalitiesService.name);
  constructor(private prisma: PrismaService) {}

  async findByCity(cityId: string) {
    return this.prisma.locality.findMany({ where: { cityId }, orderBy: { name: 'asc' } });
  }

  // Get-or-create: builders add localities on the spot while creating a
  // project (no admin approval — see the ADR note on this decision). Name
  // is normalized so "Bopal" / "bopal " / "BOPAL" all resolve to the same
  // row instead of creating near-duplicates.
  async create(cityId: string, name: string) {
    const city = await this.prisma.city.findUnique({ where: { id: cityId } });
    if (!city) throw new NotFoundException('City not found');

    const trimmedName = name.trim().replace(/\s+/g, ' ');
    const slug = slugify(trimmedName, { lower: true, strict: true });

    const existing = await this.prisma.locality.findUnique({
      where: { cityId_slug: { cityId, slug } },
    });
    if (existing) return existing;

    return this.prisma.locality.create({
      data: { cityId, name: trimmedName, slug },
    });
  }
}
