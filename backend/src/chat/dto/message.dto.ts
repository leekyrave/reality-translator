import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString, Length } from 'class-validator';
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

@Exclude()
export class MessageResponseDto {
  @Expose()
  workspaceId: string;
}