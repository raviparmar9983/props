import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'builder@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'min8charsStrong1!' })
  @IsString()
  password: string;
}
