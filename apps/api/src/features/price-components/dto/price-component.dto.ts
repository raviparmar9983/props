import { IsString, IsOptional, IsBoolean, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePriceComponentDto {
  @ApiProperty({ example: 'Car parking' })
  @IsString()
  label: string;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isIncludedInBasePrice?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class UpdatePriceComponentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isIncludedInBasePrice?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
