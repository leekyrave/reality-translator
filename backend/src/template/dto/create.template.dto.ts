import { Exclude, Expose } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @Length(1, 64)
  title: string;

  @IsString()
  @Length(1, 64)
  role: string;

  @IsString()
  @Length(1, 1024)
  content: string;
}

@Exclude()
export class CreateTemplateResponseDto {
  @Expose()
  id: string;
}
