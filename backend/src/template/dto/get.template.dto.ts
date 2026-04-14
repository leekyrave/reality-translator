import { Exclude, Expose } from 'class-transformer';

export class GetTemplateDto {}

export class GetTemplateByIdDto {}

@Exclude()
export class GetTemplateResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  role: string;

  @Expose()
  content: string;
}
