import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorkspaceDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 64)
  title: string;
}

@Exclude()
export class UpdateWorkspaceResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
}
