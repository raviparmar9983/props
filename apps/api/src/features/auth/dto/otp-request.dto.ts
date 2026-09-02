import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtpRequestDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  email: string;
}
