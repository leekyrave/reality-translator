import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTemplateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 64)
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 64)
  role: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 1024)
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault: boolean;
}

@Exclude()
export class UpdateTemplateResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
}
