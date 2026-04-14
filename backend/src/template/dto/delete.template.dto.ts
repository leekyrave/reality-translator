import { Exclude } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class DeleteTemplateDto {
  @IsUUID()
  id: string;
}

@Exclude()
export class DeleteTemplateResponseDto {}
