import { IsString, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @MaxLength(120)
  reviewerName: string;

  @ApiProperty({ example: 4, description: 'Rating 1-5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Smooth handover and good quality.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
