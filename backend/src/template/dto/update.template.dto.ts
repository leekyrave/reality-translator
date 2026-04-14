import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class UpdateTemplateDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  title: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  role: string;

  @IsOptional()
  @IsString()
  @Length(1, 1024)
  content: string;
}

@Exclude()
export class UpdateTemplateResponseDto {
  @Expose()
  id: string;
}
