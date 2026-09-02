import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BuilderVerificationStatus } from '@prisma/client';

export class VerifyBuilderDto {
  @ApiProperty({ enum: BuilderVerificationStatus })
  @IsEnum(BuilderVerificationStatus)
  status: BuilderVerificationStatus;
}

export class RejectBuilderDto {
  @ApiProperty({ example: 'RERA number could not be verified' })
  @IsString()
  reason: string;
}
