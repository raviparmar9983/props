import { IsEmail, IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'builder@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '482913' })
  @IsString()
  @Length(4, 10)
  otp: string;

  @ApiProperty({ example: 'NewPass123!' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
