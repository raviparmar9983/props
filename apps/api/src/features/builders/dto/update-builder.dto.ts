import { IsString, IsOptional, IsInt, IsNumber, Min, Max, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBuilderDto {
  @ApiPropertyOptional({ example: 'Skyline Developers Ltd' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @ApiPropertyOptional({ example: '+919999999999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'RERA12345' })
  @IsOptional()
  @IsString()
  reraNumber?: string;

  @ApiPropertyOptional({ example: '22AAAAA0000A1Z5' })
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiPropertyOptional({ description: 'Company logo URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsInBusiness?: number;

  @ApiPropertyOptional({ example: 24 })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalProjectsCompleted?: number;

  @ApiPropertyOptional({ example: 96.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  onTimeDeliveryRate?: number;
}
