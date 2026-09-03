import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString, MaxLength, IsArray, IsInt, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus, ReraStatus, CertificateStatus, LandTitleType, LitigationStatus, MaintenanceFrequency } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'Skyline Heights' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'uuid-of-city' })
  @IsString()
  cityId: string;

  @ApiProperty({ example: 'uuid-of-locality' })
  @IsString()
  localityId: string;

  @ApiPropertyOptional({ example: 'A premium residential project' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reraProjectNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  possessionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ogImageUrl?: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reraProjectNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  possessionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @ApiPropertyOptional({ enum: ReraStatus })
  @IsOptional()
  @IsEnum(ReraStatus)
  reraStatus?: ReraStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reraPortalUrl?: string;

  @ApiPropertyOptional({ enum: CertificateStatus })
  @IsOptional()
  @IsEnum(CertificateStatus)
  occupancyCertStatus?: CertificateStatus;

  @ApiPropertyOptional({ enum: CertificateStatus })
  @IsOptional()
  @IsEnum(CertificateStatus)
  commencementCertStatus?: CertificateStatus;

  @ApiPropertyOptional({ enum: LandTitleType })
  @IsOptional()
  @IsEnum(LandTitleType)
  landTitleType?: LandTitleType;

  @ApiPropertyOptional({ enum: LitigationStatus })
  @IsOptional()
  @IsEnum(LitigationStatus)
  litigationStatus?: LitigationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  litigationDetails?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  structureType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  powerBackupCapacity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  waterSource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  liftBrand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  liftCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fireSafetyCompliant?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  openSpacePercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  greenAreaPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasCctv?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasGatedEntry?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  securityGuardCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  petPolicy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  neighborhoodOverview?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoWalkthroughUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  virtualTour3dUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowsSiteVisitBooking?: boolean;

  @ApiPropertyOptional({ example: 2500, description: 'Recurring maintenance/upkeep charge amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maintenanceAmount?: number;

  @ApiPropertyOptional({ enum: MaintenanceFrequency })
  @IsOptional()
  @IsEnum(MaintenanceFrequency)
  maintenanceFrequency?: MaintenanceFrequency;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateProjectAmenitiesDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Amenity IDs to attach to the project' })
  @IsArray()
  @IsInt({ each: true })
  amenityIds: number[];
}
