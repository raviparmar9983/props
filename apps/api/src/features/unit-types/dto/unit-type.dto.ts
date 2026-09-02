import { IsString, IsOptional, IsEnum, IsInt, IsNumber, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType, AreaUnit, PriceUnit, Facing } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateUnitTypeDto {
  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ example: '3BHK' })
  @IsString()
  label: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  towerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  floorNumber?: number;

  @ApiPropertyOptional({ enum: Facing })
  @IsOptional()
  @IsEnum(Facing)
  facing?: Facing;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  viewType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  carpetArea?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  builtUpArea?: number;

  @ApiPropertyOptional({ enum: AreaUnit })
  @IsOptional()
  @IsEnum(AreaUnit)
  areaUnit?: AreaUnit;

  @ApiProperty({ example: 8500000 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ enum: PriceUnit })
  @IsOptional()
  @IsEnum(PriceUnit)
  priceUnit?: PriceUnit;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bookingAmount?: number;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(1)
  totalCount: number;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(0)
  availableCount: number;

  @ApiPropertyOptional({ example: { bedrooms: 3, bathrooms: 2, furnishing: 'semi' } })
  @IsOptional()
  attributes?: any;
}

export class UpdateUnitTypeDto {
  @ApiPropertyOptional({ enum: PropertyType })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  towerId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  floorNumber?: number;

  @ApiPropertyOptional({ enum: Facing })
  @IsOptional()
  @IsEnum(Facing)
  facing?: Facing;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  viewType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  carpetArea?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  builtUpArea?: number;

  @ApiPropertyOptional({ enum: AreaUnit })
  @IsOptional()
  @IsEnum(AreaUnit)
  areaUnit?: AreaUnit;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ enum: PriceUnit })
  @IsOptional()
  @IsEnum(PriceUnit)
  priceUnit?: PriceUnit;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bookingAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  totalCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  availableCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  attributes?: any;
}
