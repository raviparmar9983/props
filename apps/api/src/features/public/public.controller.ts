import { Controller, Get, Param, Query, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { PublicService } from './public.service';
import { CreateReviewDto } from './dto/review.dto';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Public()
  @Get('projects')
  @ApiOperation({ summary: 'Search and filter approved projects' })
  @ApiQuery({ name: 'q', required: false, description: 'Free-text keyword (title, description, city, locality, builder name)' })
  @ApiQuery({ name: 'city', required: false, description: 'City slug' })
  @ApiQuery({ name: 'localityId', required: false, description: 'Locality id (requires city)' })
  @ApiQuery({ name: 'locality', required: false, description: 'Locality slug' })
  @ApiQuery({ name: 'builder', required: false, description: 'Builder slug' })
  @ApiQuery({ name: 'propertyType', required: false, description: 'Comma-separated PropertyType values (OR)' })
  @ApiQuery({ name: 'bedrooms', required: false, description: 'Comma-separated bedroom counts (OR); 4 means 4 BHK or more' })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'minArea', required: false, description: 'Minimum carpet area in sqft' })
  @ApiQuery({ name: 'maxArea', required: false, description: 'Maximum carpet area in sqft' })
  @ApiQuery({ name: 'minBuiltUp', required: false, description: 'Minimum built-up area in sqft' })
  @ApiQuery({ name: 'maxBuiltUp', required: false, description: 'Maximum built-up area in sqft' })
  @ApiQuery({ name: 'amenities', required: false, description: 'Comma-separated amenity IDs (AND)' })
  @ApiQuery({ name: 'verifiedOnly', required: false, enum: ['true', 'false'], description: 'Only projects from builders with a RERA number' })
  @ApiQuery({ name: 'verified', required: false, enum: ['true', 'false'], description: 'Deprecated alias for verifiedOnly' })
  @ApiQuery({ name: 'possessionStatus', required: false, description: 'Comma-separated ProjectStatus values (OR)' })
  @ApiQuery({ name: 'facing', required: false, description: 'Comma-separated Facing enum values (OR): NORTH, SOUTH, EAST, WEST, NORTH_EAST, NORTH_WEST, SOUTH_EAST, SOUTH_WEST' })
  @ApiQuery({ name: 'hasGatedEntry', required: false, enum: ['true', 'false'], description: 'Only gated-community projects' })
  @ApiQuery({ name: 'hasCctv', required: false, enum: ['true', 'false'], description: 'Only projects with CCTV' })
  @ApiQuery({ name: 'fireSafetyCompliant', required: false, enum: ['true', 'false'], description: 'Only fire-safety-compliant projects' })
  @ApiQuery({ name: 'availableOnly', required: false, enum: ['true', 'false'], description: 'Only unit types with availableCount > 0' })
  @ApiQuery({ name: 'landTitleType', required: false, enum: ['FREEHOLD', 'LEASEHOLD'], description: 'Land title filter' })
  @ApiQuery({ name: 'reraStatus', required: false, enum: ['ACTIVE', 'EXPIRED', 'NOT_REQUIRED'], description: 'RERA status of the project' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'price_asc', 'price_desc', 'featured'] })
  async searchProjects(
    @Query('q') q?: string,
    @Query('city') city?: string,
    @Query('localityId') localityId?: string,
    @Query('locality') locality?: string,
    @Query('builder') builder?: string,
    @Query('propertyType') propertyType?: string,
    @Query('bedrooms') bedrooms?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minArea') minArea?: string,
    @Query('maxArea') maxArea?: string,
    @Query('minBuiltUp') minBuiltUp?: string,
    @Query('maxBuiltUp') maxBuiltUp?: string,
    @Query('amenities') amenities?: string,
    @Query('verifiedOnly') verifiedOnly?: string,
    @Query('verified') verified?: string,
    @Query('possessionStatus') possessionStatus?: string,
    @Query('facing') facing?: string,
    @Query('hasGatedEntry') hasGatedEntry?: string,
    @Query('hasCctv') hasCctv?: string,
    @Query('fireSafetyCompliant') fireSafetyCompliant?: string,
    @Query('availableOnly') availableOnly?: string,
    @Query('landTitleType') landTitleType?: string,
    @Query('reraStatus') reraStatus?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    return this.publicService.searchProjects({
      q, city, localityId, locality, builder, propertyType, bedrooms, amenities, possessionStatus, sort,
      facing,
      landTitleType,
      reraStatus,
      verifiedOnly: (verifiedOnly ?? verified) === 'true',
      hasGatedEntry: hasGatedEntry === 'true',
      hasCctv: hasCctv === 'true',
      fireSafetyCompliant: fireSafetyCompliant === 'true',
      availableOnly: availableOnly === 'true',
      minPrice: minPrice !== undefined ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? parseFloat(maxPrice) : undefined,
      minArea: minArea !== undefined ? parseFloat(minArea) : undefined,
      maxArea: maxArea !== undefined ? parseFloat(maxArea) : undefined,
      minBuiltUp: minBuiltUp !== undefined ? parseFloat(minBuiltUp) : undefined,
      maxBuiltUp: maxBuiltUp !== undefined ? parseFloat(maxBuiltUp) : undefined,
      page: page !== undefined ? parseInt(page, 10) : undefined,
      limit: limit !== undefined ? parseInt(limit, 10) : undefined,
    });
  }

  @Public()
  @Get('stats')
  @ApiOperation({ summary: 'Aggregate public platform stats (verified builders, projects, cities)' })
  async getStats() {
    return this.publicService.getStats();
  }

  @Public()
  @Get('projects/suggest')
  @ApiOperation({ summary: 'Suggest projects by name/city/locality for compare dropdown' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (min 2 chars)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (default 6)' })
  async suggestProjects(
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ) {
    const max = limit ? Math.min(parseInt(limit, 10), 10) : 6;
    return this.publicService.suggestProjects(q, max);
  }

  @Public()
  @Get('projects/compare')
  @ApiOperation({ summary: 'Compare 2-3 projects side by side' })
  @ApiQuery({ name: 'slugs', required: true, description: 'Comma-separated project slugs (max 3)' })
  async compareProjects(@Query('slugs') slugsParam: string) {
    const slugs = slugsParam
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    return this.publicService.compareProjects(slugs);
  }

  @Public()
  @Get('projects/:slug')
  @ApiOperation({ summary: 'Get project detail by slug (SEO)' })
  async getProjectBySlug(@Param('slug') slug: string) {
    return this.publicService.getProjectBySlug(slug);
  }

  @ApiBearerAuth()
  @Get('projects/:slug/contact')
  @ApiOperation({ summary: 'Get builder contact details (logged-in customers only)' })
  async getProjectContact(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.publicService.getProjectContact(slug, user.sub);
  }

  @Public()
  @Get('cities')
  @ApiOperation({ summary: 'List all cities' })
  async getCities() {
    return this.publicService.getCities();
  }

  @Public()
  @Get('localities')
  @ApiOperation({ summary: 'List localities by city' })
  @ApiQuery({ name: 'cityId', required: true })
  async getLocalities(@Query('cityId') cityId: string) {
    return this.publicService.getLocalities(cityId);
  }

  @Public()
  @Get('amenities')
  @ApiOperation({ summary: 'List all amenities' })
  async getAmenities() {
    return this.publicService.getAmenities();
  }

  @Public()
  @Get('builders')
  @ApiOperation({ summary: 'List verified builders with published projects' })
  async getBuilders() {
    return this.publicService.getBuilders();
  }

  @Public()
  @Get('builders/:slug')
  @ApiOperation({ summary: 'Get builder public profile with portfolio and reviews' })
  async getBuilderBySlug(@Param('slug') slug: string) {
    return this.publicService.getBuilderBySlug(slug);
  }

  @Public()
  @Get('builders/:slug/portfolio')
  @ApiOperation({ summary: 'List builder portfolio projects' })
  async getBuilderPortfolio(@Param('slug') slug: string) {
    return this.publicService.getBuilderPortfolio(slug);
  }

  @Public()
  @Get('builders/:slug/reviews')
  @ApiOperation({ summary: 'List builder reviews' })
  async getBuilderReviews(@Param('slug') slug: string) {
    return this.publicService.getBuilderReviews(slug);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post('builders/:slug/reviews')
  @ApiOperation({ summary: 'Create a review for a builder (customer only, one per customer)' })
  async createBuilderReview(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReviewDto,
  ) {
    return this.publicService.createBuilderReview(slug, user.sub, dto);
  }
}
