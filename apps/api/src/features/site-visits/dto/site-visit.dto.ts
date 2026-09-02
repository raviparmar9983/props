import { IsString, IsOptional, IsDateString, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SiteVisitStatus } from '@prisma/client';

export class CreateSiteVisitDto {
  @ApiProperty({ example: 'uuid-of-project' })
  @IsString()
  projectId: string;

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  customerName: string;

  @ApiProperty({ example: 'rahul@example.com' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: '2026-08-20' })
  @IsDateString()
  preferredDate: string;

  @ApiPropertyOptional({ example: '10:00-11:00' })
  @IsOptional()
  @IsString()
  preferredSlot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSiteVisitStatusDto {
  @ApiProperty({ enum: SiteVisitStatus })
  @IsEnum(SiteVisitStatus)
  status: SiteVisitStatus;
}
