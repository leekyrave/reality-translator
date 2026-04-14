import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class HistoryResponseDto {
  @Expose()
  id: string;
  @Expose()
  role: string;
  @Expose()
  content: string;
  @Expose()
  createdAt?: Date;
}
