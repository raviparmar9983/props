import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterBuilderDto {
  @ApiProperty({ example: 'builder@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'min8charsStrong1!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'Skyline Developers' })
  @IsString()
  @MaxLength(200)
  companyName: string;

  @ApiProperty({ example: 'uuid-of-city' })
  @IsString()
  cityId: string;

  @ApiPropertyOptional({ example: '+919999999999' })
  @IsOptional()
  @IsString()
  phone?: string;
}
