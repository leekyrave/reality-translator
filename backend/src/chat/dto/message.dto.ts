import { Exclude } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty()
  @IsString()
  @Length(1, 1024)
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workspace?: string;
}
