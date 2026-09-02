import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpecCategory } from '@prisma/client';

export class CreateSpecificationDto {
  @ApiProperty({ enum: SpecCategory })
  @IsEnum(SpecCategory)
  category: SpecCategory;

  @ApiProperty({ example: 'Flooring' })
  @IsString()
  label: string;

  @ApiProperty({ example: 'Vitrified tiles' })
  @IsString()
  value: string;
}

export class UpdateSpecificationDto {
  @ApiPropertyOptional({ enum: SpecCategory })
  @IsOptional()
  @IsEnum(SpecCategory)
  category?: SpecCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  value?: string;
}
