import { Injectable, NotFoundException, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { ProjectStatus, ProjectVerificationStatus, ProjectReviewStatus, PropertyType, BuilderVerificationStatus, Prisma, MediaType, LandmarkCategory } from '@prisma/client';
import { normalizePagination } from '../../common/utils/pagination';
import { CreateReviewDto } from './dto/review.dto';

const SEARCHABLE_STATUSES: ProjectStatus[] = [
  ProjectStatus.UPCOMING,
  ProjectStatus.UNDER_CONSTRUCTION,
  ProjectStatus.READY,
];

const SEARCH_SORTS = ['newest', 'price_asc', 'price_desc', 'featured'] as const;

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  private visibleProjectFilter(): any {
    return {
      deletedAt: null,
      verificationStatus: ProjectVerificationStatus.APPROVED,
      reviewStatus: ProjectReviewStatus.APPROVED,
      status: { notIn: [ProjectStatus.DRAFT, ProjectStatus.ARCHIVED] },
    };
  }

  async searchProjects(query: {
    q?: string;
    city?: string;
    localityId?: string;
    locality?: string;
    builder?: string;
    propertyType?: string;
    bedrooms?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    amenities?: string;
    verifiedOnly?: boolean;
    possessionStatus?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const { page, limit } = normalizePagination(query.page, query.limit, 50);

    // ---- Validation ----
    if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
      throw new BadRequestException({
        code: 'INVALID_RANGE',
        message: 'minPrice cannot be greater than maxPrice',
      });
    }
    if (query.minArea !== undefined && query.maxArea !== undefined && query.minArea > query.maxArea) {
      throw new BadRequestException({
        code: 'INVALID_RANGE',
        message: 'minArea cannot be greater than maxArea',
      });
    }

    const propertyTypes = this.splitCsv(query.propertyType) as PropertyType[];
    for (const t of propertyTypes) {
      if (!Object.values(PropertyType).includes(t)) {
        throw new BadRequestException({
          code: 'INVALID_FILTER_VALUE',
          message: `Invalid propertyType: ${t}`,
        });
      }
    }

    const possessionStatuses = this.splitCsv(query.possessionStatus) as ProjectStatus[];
    for (const s of possessionStatuses) {
      if (!SEARCHABLE_STATUSES.includes(s)) {
        throw new BadRequestException({
          code: 'INVALID_FILTER_VALUE',
          message: `Invalid possessionStatus: ${s}`,
        });
      }
    }

    const sort = query.sort && query.sort !== 'newest' ? query.sort : 'newest';
    if (!(SEARCH_SORTS as readonly string[]).includes(sort)) {
      throw new BadRequestException({
        code: 'INVALID_FILTER_VALUE',
        message: `Invalid sort: ${query.sort}`,
      });
    }

    const bedroomValues = this.splitCsv(query.bedrooms)
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n >= 1);

    const amenityIds = this.splitCsv(query.amenities)
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n > 0);

    // ---- Filter assembly (AND across categories; OR within propertyType/bedrooms) ----
    const where: any = this.visibleProjectFilter();

    const q = query.q?.trim();
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { city: { name: { contains: q, mode: 'insensitive' } } },
        { locality: { name: { contains: q, mode: 'insensitive' } } },
        { builder: { companyName: { contains: q, mode: 'insensitive' } } },
      ];
    }
    if (query.city) {
      where.city = { slug: query.city };
    }
    if (query.localityId) {
      where.localityId = query.localityId;
    } else if (query.locality) {
      where.locality = { slug: query.locality };
    }
    if (query.builder) {
      where.builder = { slug: query.builder };
    }
    if (query.verifiedOnly) {
      where.builder = {
        ...(where.builder ?? {}),
        verificationStatus: BuilderVerificationStatus.VERIFIED,
      };
    }

    // Unit-type level filters all apply to the SAME unit type (type OR, bedrooms OR,
    // price range, carpet area range) via a single `some` relation filter.
    const unitSome: any = {};
    if (propertyTypes.length > 0) {
      unitSome.propertyType = { in: propertyTypes };
    }
    if (bedroomValues.length > 0) {
      unitSome.OR = bedroomValues.map((n) => (n >= 4 ? { bedrooms: { gte: 4 } } : { bedrooms: n }));
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      unitSome.price = { gte: query.minPrice, lte: query.maxPrice };
    }
    if (query.minArea !== undefined || query.maxArea !== undefined) {
      unitSome.carpetArea = { gte: query.minArea, lte: query.maxArea };
    }
    if (Object.keys(unitSome).length > 0) {
      where.unitTypes = { some: unitSome };
    }

    // Amenities are ANDed: one `some: { amenityId }` clause per selected amenity.
    if (amenityIds.length > 0) {
      where.AND = amenityIds.map((id) => ({
        amenities: { some: { amenityId: id } },
      }));
    }

    // Possession status restricts the searchable statuses to the selected ones.
    if (possessionStatuses.length > 0) {
      where.status = {
        notIn: [ProjectStatus.DRAFT, ProjectStatus.ARCHIVED],
        in: possessionStatuses,
      };
    }

    const summaryInclude: Prisma.ProjectInclude = {
      city: true,
      locality: true,
      builder: { select: { id: true, companyName: true, slug: true, logo: true } },
      media: { orderBy: { displayOrder: 'asc' }, take: 6 },
      unitTypes: { select: { price: true, propertyType: true, bedrooms: true } },
      amenities: { include: { amenity: true } },
    };
    type SummaryProject = Prisma.ProjectGetPayload<{ include: typeof summaryInclude }>;

    let projects: SummaryProject[];
    let total;

    if (sort === 'price_asc' || sort === 'price_desc') {
      // Prisma relation orderBy does not support _min/_max aggregates in this
      // client version, so price sorts are computed from each project's minimum
      // unit price and applied in-memory before paginating.
      const all = await this.prisma.project.findMany({
        where,
        select: { id: true, unitTypes: { select: { price: true } } },
      });
      total = all.length;
      const minPrices = new Map<string, number>();
      for (const p of all) {
        if (p.unitTypes.length === 0) continue;
        minPrices.set(p.id, Math.min(...p.unitTypes.map((u) => Number(u.price))));
      }
      const ordered = [...all].sort((a, b) => {
        const pa = minPrices.get(a.id) ?? Infinity;
        const pb = minPrices.get(b.id) ?? Infinity;
        return sort === 'price_asc' ? pa - pb : pb - pa;
      });
      const pageIds = ordered.map((p) => p.id).slice((page - 1) * limit, (page - 1) * limit + limit);
      const rows =
        pageIds.length > 0
          ? await this.prisma.project.findMany({
              where: { id: { in: pageIds } },
              include: summaryInclude,
            })
          : [];
      const byId = new Map(rows.map((p) => [p.id, p]));
      projects = pageIds.map((id) => byId.get(id)).filter((p): p is SummaryProject => Boolean(p));
    } else {
      let orderBy: any = { createdAt: 'desc' };
      if (sort === 'featured') orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
      [projects, total] = await Promise.all([
        this.prisma.project.findMany({
          where,
          include: summaryInclude,
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
        }),
        this.prisma.project.count({ where }),
      ]);
    }

    const data = await Promise.all(
      projects.map(async (p) => {
        const prices = p.unitTypes.map((u) => Number(u.price));
        const propertyTypes = [...new Set(p.unitTypes.map((u) => u.propertyType))];
        const bedroomCounts = [...new Set(p.unitTypes.map((u) => u.bedrooms).filter((b): b is number => b != null))];
        const media = [...p.media].sort(
          (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.displayOrder - b.displayOrder,
        );
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          city: p.city.name,
          locality: p.locality.name,
          builder: {
            companyName: p.builder.companyName,
            slug: p.builder.slug,
            logo: await this.storageService.resolvePublicUrl(p.builder.logo),
          },
          priceStartingFrom: prices.length > 0 ? Math.min(...prices) : null,
          propertyTypes,
          bedrooms: bedroomCounts.length > 0 ? Math.min(...bedroomCounts) : null,
          primaryImageUrl: await this.storageService.resolvePublicUrl(media[0]?.url ?? null),
          media: await Promise.all(media.map((m) => this.storageService.resolvePublicUrl(m.url))),
          status: p.status,
          isFeatured: p.isFeatured,
        };
      }),
    );

    const appliedFilters: Record<string, unknown> = { sort };
    if (q) appliedFilters.q = q;
    if (query.city) appliedFilters.city = query.city;
    if (query.localityId) appliedFilters.localityId = query.localityId;
    else if (query.locality) appliedFilters.locality = query.locality;
    if (query.builder) appliedFilters.builder = query.builder;
    if (propertyTypes.length > 0) appliedFilters.propertyType = propertyTypes;
    if (bedroomValues.length > 0) appliedFilters.bedrooms = bedroomValues;
    if (query.minPrice !== undefined) appliedFilters.minPrice = query.minPrice;
    if (query.maxPrice !== undefined) appliedFilters.maxPrice = query.maxPrice;
    if (query.minArea !== undefined) appliedFilters.minArea = query.minArea;
    if (query.maxArea !== undefined) appliedFilters.maxArea = query.maxArea;
    if (amenityIds.length > 0) appliedFilters.amenities = amenityIds;
    if (query.verifiedOnly) appliedFilters.verifiedOnly = true;
    if (possessionStatuses.length > 0) appliedFilters.possessionStatus = possessionStatuses;

    return { data, meta: { page, limit, total }, appliedFilters };
  }

  private splitCsv(value?: string): string[] {
    if (!value) return [];
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  async getProjectBySlug(slug: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        slug,
        deletedAt: null,
        verificationStatus: ProjectVerificationStatus.APPROVED,
        reviewStatus: ProjectReviewStatus.APPROVED,
        status: { notIn: [ProjectStatus.DRAFT, ProjectStatus.ARCHIVED] },
      },
      include: {
        city: true,
        locality: true,
        builder: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            logo: true,
            verificationStatus: true,
            yearsInBusiness: true,
            totalProjectsCompleted: true,
            onTimeDeliveryRate: true,
          },
        },
        towers: true,
        unitTypes: {
          include: {
            tower: true,
            media: {
              where: { type: MediaType.FLOOR_PLAN },
              select: { url: true },
              take: 1,
            },
          },
          orderBy: { price: 'asc' },
        },
        media: { orderBy: { displayOrder: 'asc' } },
        amenities: { include: { amenity: true } },
        landmarks: { orderBy: { distanceKm: 'asc' } },
        priceComponents: { orderBy: { displayOrder: 'asc' } },
        paymentPlans: { orderBy: { createdAt: 'asc' } },
        bankPartners: { orderBy: { createdAt: 'asc' } },
        constructionUpdates: { orderBy: { updateDate: 'desc' } },
        specifications: { orderBy: { category: 'asc' } },
        faqs: { orderBy: { displayOrder: 'asc' } },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    // Increment view count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.prisma.$executeRaw`
      INSERT INTO "ProjectViewLog" ("projectId", "viewDate", "viewCount")
      VALUES (${project.id}::text, ${today}::timestamp, 1)
      ON CONFLICT ("projectId", "viewDate")
      DO UPDATE SET "viewCount" = "ProjectViewLog"."viewCount" + 1
    `;

    const reviews = await this.prisma.builderReview.aggregate({
      where: { builderId: project.builderId },
      _avg: { rating: true },
      _count: { _all: true },
    });

    return {
      ...project,
      // litigationDetails is intentionally builder-only (product decision).
      litigationDetails: undefined,
      builder: {
        ...project.builder,
        logo: await this.storageService.resolvePublicUrl(project.builder.logo),
        reviewsSummary: {
          averageRating: reviews._avg.rating,
          count: reviews._count._all,
        },
        user: undefined,
      },
      contacts: [],
      media: await Promise.all(
        project.media.map(async (m) => ({
          ...m,
          url: await this.storageService.resolvePublicUrl(m.url),
        })),
      ),
      ogImageUrl: await this.storageService.resolvePublicUrl(project.ogImageUrl),
      unitTypes: await Promise.all(
        project.unitTypes.map(async (ut) => ({
          ...ut,
          floorPlanImageUrl: await this.storageService.resolvePublicUrl(ut.media[0]?.url ?? null),
        })),
      ),
      constructionUpdates: await Promise.all(
        project.constructionUpdates.map(async (c) => ({
          ...c,
          photoUrl: await this.storageService.resolvePublicUrl(c.photoUrl),
        })),
      ),
      bankPartners: await Promise.all(
        project.bankPartners.map(async (b) => ({
          ...b,
          logoUrl: await this.storageService.resolvePublicUrl(b.logoUrl),
        })),
      ),
    };
  }

  async getProjectContact(slug: string, customerId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        slug,
        deletedAt: null,
        verificationStatus: ProjectVerificationStatus.APPROVED,
        reviewStatus: ProjectReviewStatus.APPROVED,
        status: { notIn: [ProjectStatus.DRAFT, ProjectStatus.ARCHIVED] },
      },
      include: {
        builder: { include: { user: { select: { email: true } } } },
        contacts: { orderBy: { isPrimary: 'desc' } },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    return {
      projectId: project.id,
      builder: {
        id: project.builder.id,
        companyName: project.builder.companyName,
        phone: project.builder.phone,
        email: project.builder.user?.email ?? null,
      },
      contacts: project.contacts.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        designation: c.designation,
        isPrimary: c.isPrimary,
      })),
    };
  }

  async getCities() {
    return this.prisma.city.findMany({ orderBy: { name: 'asc' } });
  }

  async getLocalities(cityId: string) {
    return this.prisma.locality.findMany({ where: { cityId }, orderBy: { name: 'asc' } });
  }

  async getAmenities() {
    return this.prisma.amenity.findMany({ orderBy: { name: 'asc' } });
  }

  async getBuilders() {
    const builders = await this.prisma.builderProfile.findMany({
      where: {
        verificationStatus: BuilderVerificationStatus.VERIFIED,
        projects: { some: this.visibleProjectFilter() },
      },
      select: { id: true, companyName: true, slug: true, logo: true },
      orderBy: { companyName: 'asc' },
    });

    return Promise.all(
      builders.map(async (b) => ({
        id: b.id,
        companyName: b.companyName,
        slug: b.slug,
        logo: await this.storageService.resolvePublicUrl(b.logo),
      })),
    );
  }

  async getStats() {
    const [projects, verifiedBuilders, cities, perCity, cityRows] =
      await Promise.all([
        this.prisma.project.count({ where: this.visibleProjectFilter() }),
        this.prisma.builderProfile.count({
          where: { verificationStatus: BuilderVerificationStatus.VERIFIED },
        }),
        this.prisma.city.count(),
        this.prisma.project.groupBy({
          by: ['cityId'],
          where: this.visibleProjectFilter(),
          _count: { _all: true },
        }),
        this.prisma.city.findMany(),
      ]);

    const cityMap = new Map(cityRows.map((c) => [c.id, c]));

    const citiesWithCounts = perCity
      .map((g) => {
        const city = cityMap.get(g.cityId);
        return {
          slug: city?.slug ?? '',
          name: city?.name ?? '',
          count: g._count._all,
        };
      })
      .filter((c) => c.slug)
      .sort((a, b) => b.count - a.count);

    return { projects, verifiedBuilders, cities, citiesWithCounts };
  }

  private async getVerifiedBuilderBySlug(slug: string) {
    const builder = await this.prisma.builderProfile.findFirst({
      where: { slug, verificationStatus: BuilderVerificationStatus.VERIFIED },
      include: { city: true },
    });
    if (!builder) throw new NotFoundException('Builder not found');
    return builder;
  }

  async getBuilderBySlug(slug: string) {
    const builder = await this.getVerifiedBuilderBySlug(slug);

    const [projectsCount, reviews, portfolio] = await Promise.all([
      this.prisma.project.count({
        where: { builderId: builder.id, ...this.visibleProjectFilter() },
      }),
      this.prisma.builderReview.findMany({
        where: { builderId: builder.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.builderPortfolioProject.findMany({
        where: { builderId: builder.id },
        orderBy: { completionYear: 'desc' },
      }),
    ]);

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    return {
      id: builder.id,
      companyName: builder.companyName,
      slug: builder.slug,
      logo: await this.storageService.resolvePublicUrl(builder.logo),
      city: builder.city.name,
      reraNumber: builder.reraNumber,
      yearsInBusiness: builder.yearsInBusiness,
      totalProjectsCompleted: builder.totalProjectsCompleted,
      onTimeDeliveryRate: builder.onTimeDeliveryRate,
      verificationStatus: builder.verificationStatus,
      stats: { projectsCount, averageRating, reviewCount: reviews.length },
      reviews,
      portfolio: await Promise.all(
        portfolio.map(async (p) => ({
          ...p,
          coverImageUrl: await this.storageService.resolvePublicUrl(p.coverImageUrl),
        })),
      ),
    };
  }

  async getBuilderPortfolio(slug: string) {
    const builder = await this.getVerifiedBuilderBySlug(slug);
    const rows = await this.prisma.builderPortfolioProject.findMany({
      where: { builderId: builder.id },
      orderBy: { completionYear: 'desc' },
    });
    return Promise.all(
      rows.map(async (p) => ({
        ...p,
        coverImageUrl: await this.storageService.resolvePublicUrl(p.coverImageUrl),
      })),
    );
  }

  async getBuilderReviews(slug: string) {
    const builder = await this.getVerifiedBuilderBySlug(slug);
    return this.prisma.builderReview.findMany({
      where: { builderId: builder.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBuilderReview(slug: string, customerId: string, dto: CreateReviewDto) {
    const builder = await this.getVerifiedBuilderBySlug(slug);

    const existing = await this.prisma.builderReview.findFirst({
      where: { builderId: builder.id, customerId },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this builder');
    }

    return this.prisma.builderReview.create({
      data: {
        builderId: builder.id,
        customerId,
        reviewerName: dto.reviewerName,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async compareProjects(slugs: string[]) {
    if (slugs.length > 3) {
      throw new BadRequestException({
        code: 'TOO_MANY_SLUGS',
        message: 'You can compare up to 3 properties at a time.',
      });
    }

    const visible = this.visibleProjectFilter();

    const projects = await this.prisma.project.findMany({
      where: { slug: { in: slugs }, ...visible },
      include: {
        city: true,
        locality: true,
        builder: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            verificationStatus: true,
            yearsInBusiness: true,
            totalProjectsCompleted: true,
            onTimeDeliveryRate: true,
          },
        },
        unitTypes: {
          select: {
            id: true,
            price: true,
            carpetArea: true,
            label: true,
            propertyType: true,
            bedrooms: true,
            availableCount: true,
          },
          orderBy: { price: 'asc' },
        },
        media: {
          where: { type: MediaType.IMAGE },
          orderBy: { displayOrder: 'asc' },
          take: 1,
          select: { url: true, isPrimary: true },
        },
        amenities: {
          include: { amenity: { select: { name: true } } },
        },
        landmarks: {
          orderBy: { distanceKm: 'asc' },
          select: { category: true, name: true, distanceKm: true },
        },
        paymentPlans: {
          select: { type: true, bookingAmount: true },
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Fetch builder reviews for each project's builder
    const builderIds = [...new Set(projects.map(p => p.builderId))];
    const reviewAggregates = await this.prisma.builderReview.groupBy({
      by: ['builderId'],
      where: { builderId: { in: builderIds } },
      _avg: { rating: true },
      _count: { _all: true },
    });
    const reviewMap = new Map(reviewAggregates.map(r => [r.builderId, { avg: r._avg.rating, count: r._count._all }]));

    // Build slug-indexed lookup
    const slugSet = new Set(slugs);
    const projectBySlug = new Map(projects.map(p => [p.slug, p]));

    const data = [];
    for (const slug of slugs) {
      const p = projectBySlug.get(slug);
      if (!p) continue;

      const prices = p.unitTypes.map(u => Number(u.price));
      const startingPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const startingUnit = p.unitTypes.find(u => Number(u.price) === startingPrice);
      const pricePerSqft = startingUnit?.carpetArea
        ? Math.round(startingPrice / startingUnit.carpetArea)
        : null;

      const primaryMedia = p.media.find(m => m.isPrimary) ?? p.media[0];
      const primaryImageUrl = primaryMedia
        ? await this.storageService.resolvePublicUrl(primaryMedia.url)
        : null;

      // Unit types summary
      const unitTypesSummary = p.unitTypes.map(u => ({
        label: u.label,
        price: Number(u.price),
        availableCount: u.availableCount,
        propertyType: u.propertyType,
        bedrooms: u.bedrooms,
      }));

      // Property types (distinct)
      const propertyTypes = [...new Set(p.unitTypes.map(u => u.propertyType))];

      // Nearest landmarks per category
      const nearestLandmarks: Record<string, { name: string; distanceKm: number }> = {};
      const seenCategories = new Set<string>();
      for (const lm of p.landmarks) {
        if (!seenCategories.has(lm.category)) {
          seenCategories.add(lm.category);
          nearestLandmarks[lm.category] = {
            name: lm.name,
            distanceKm: lm.distanceKm,
          };
        }
      }

      // Payment plan
      const paymentPlan = p.paymentPlans[0];

      // Builder reviews
      const reviewData = reviewMap.get(p.builderId);

      const propertyTypesMapped = propertyTypes as string[];

      data.push({
        slug: p.slug,
        title: p.title,
        primaryImageUrl,
        propertyTypes: propertyTypesMapped,
        city: p.city.name,
        locality: p.locality.name,
        possessionStatus: p.status,
        startingPrice,
        pricePerSqft,
        bookingAmount: paymentPlan ? Number(paymentPlan.bookingAmount) : null,
        paymentPlanType: paymentPlan?.type ?? null,

        unitTypesSummary,

        amenities: p.amenities.map(a => a.amenity.name),

        reraStatus: p.reraStatus,
        occupancyCertStatus: p.occupancyCertStatus,
        commencementCertStatus: p.commencementCertStatus,
        landTitleType: p.landTitleType,

        structureType: p.structureType,
        powerBackupCapacity: p.powerBackupCapacity,
        waterSource: p.waterSource,
        liftBrand: p.liftBrand,
        liftCount: p.liftCount,
        fireSafetyCompliant: p.fireSafetyCompliant,

        openSpacePercent: p.openSpacePercent,
        greenAreaPercent: p.greenAreaPercent,
        hasCctv: p.hasCctv,
        hasGatedEntry: p.hasGatedEntry,
        petPolicy: p.petPolicy,

        nearestLandmarks,

        builder: {
          companyName: p.builder.companyName,
          verificationStatus: p.builder.verificationStatus,
          yearsInBusiness: p.builder.yearsInBusiness,
          totalProjectsCompleted: p.builder.totalProjectsCompleted,
          onTimeDeliveryRate: p.builder.onTimeDeliveryRate,
          averageReviewRating: reviewData?.avg ?? null,
          reviewCount: reviewData?.count ?? 0,
        },
      });
    }

    // Slugs requested but not found
    const foundSlugs = new Set(data.map(d => d.slug));
    const notFound = slugs.filter(s => !foundSlugs.has(s));

    return { data, notFound };
  }

  async suggestProjects(query: string, limit: number = 6) {
    const q = query?.trim();
    if (!q || q.length < 2) return [];

    const projects = await this.prisma.project.findMany({
      where: {
        ...this.visibleProjectFilter(),
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { city: { name: { contains: q, mode: 'insensitive' } } },
          { locality: { name: { contains: q, mode: 'insensitive' } } },
          { builder: { companyName: { contains: q, mode: 'insensitive' } } },
        ],
      },
      select: {
        slug: true,
        title: true,
        city: { select: { name: true } },
        locality: { select: { name: true } },
        unitTypes: {
          select: { price: true },
          orderBy: { price: 'asc' },
          take: 1,
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return projects.map(p => ({
      slug: p.slug,
      title: p.title,
      city: p.city.name,
      locality: p.locality.name,
      startingPrice: p.unitTypes[0]?.price ?? null,
    }));
  }
}
