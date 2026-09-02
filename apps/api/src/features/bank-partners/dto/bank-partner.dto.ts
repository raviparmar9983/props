import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankPartnerDto {
  @ApiProperty({ example: 'HDFC Bank' })
  @IsString()
  bankName: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logos/hdfc.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;
}

export class UpdateBankPartnerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string | null;
}
