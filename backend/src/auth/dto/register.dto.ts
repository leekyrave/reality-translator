import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, IsStrongPassword, Length, Matches } from 'class-validator';
import { IsNickname } from '@/common/decorators/is-latin-only.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;

  @ApiProperty()
  @IsString()
  @Length(1, 128)
  @IsNickname()
  name: string;
}

@Exclude()
export class RegisterResponseDto {}
