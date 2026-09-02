import { IsString, IsOptional, IsEnum, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LandmarkCategory } from '@prisma/client';

export class CreateLandmarkDto {
  @ApiProperty({ enum: LandmarkCategory })
  @IsEnum(LandmarkCategory)
  category: LandmarkCategory;

  @ApiProperty({ example: 'Greenwood International School' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1.2 })
  @IsNumber()
  @Min(0)
  distanceKm: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(0)
  travelTimeMinutes?: number;
}

export class UpdateLandmarkDto {
  @ApiPropertyOptional({ enum: LandmarkCategory })
  @IsOptional()
  @IsEnum(LandmarkCategory)
  category?: LandmarkCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  travelTimeMinutes?: number | null;
}
