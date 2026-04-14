import { Exclude, Expose } from 'class-transformer';
import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty()
  @IsString()
  @Length(1, 64)
  title: string;
}

@Exclude()
export class CreateWorkspaceResponseDto {
  @Expose()
  id: string;
}
