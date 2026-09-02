import { IsString, IsOptional, IsEnum, IsNumber, Min, IsDefined } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentPlanType } from '@prisma/client';

export class CreatePaymentPlanDto {
  @ApiProperty({ example: 'Construction Linked Plan' })
  @IsString()
  name: string;

  @ApiProperty({ enum: PaymentPlanType })
  @IsEnum(PaymentPlanType)
  type: PaymentPlanType;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @Min(0)
  bookingAmount: number;

  @ApiProperty({ example: [{ stage: 'Booking', amountPercent: 10 }] })
  @IsDefined()
  milestones: any;
}

export class UpdatePaymentPlanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: PaymentPlanType })
  @IsOptional()
  @IsEnum(PaymentPlanType)
  type?: PaymentPlanType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  bookingAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  milestones?: any;
}
