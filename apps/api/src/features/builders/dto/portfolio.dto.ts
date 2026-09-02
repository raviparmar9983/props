import { IsString, IsOptional, IsInt, IsBoolean, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePortfolioDto {
  @ApiProperty({ example: 'Skyline Heights' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: 2021 })
  @IsOptional()
  @IsInt()
  completionYear?: number;

  @ApiPropertyOptional({ example: 320 })
  @IsOptional()
  @IsInt()
  unitsCount?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  deliveredOnTime?: boolean;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/projects/skyline.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePortfolioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  completionYear?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  unitsCount?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  deliveredOnTime?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImageUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;
}
