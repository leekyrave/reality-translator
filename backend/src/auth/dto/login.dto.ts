import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { IsNickname } from '@/common/decorators/is-latin-only.decorator';
import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 128)
  @IsNickname()
  name: string;

  @ApiProperty()
  @IsString()
  password: string;
}

@Exclude()
export class LoginResponseDto {}
