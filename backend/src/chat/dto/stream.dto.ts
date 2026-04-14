import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class StreamResponseDto {
  @Expose()
  data: string;
}
