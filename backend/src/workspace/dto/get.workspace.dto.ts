import { Exclude, Expose } from 'class-transformer';

export class GetWorkspaceDto {}

export class GetWorkspaceByIdDto {}

@Exclude()
export class GetWorkspaceResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  messagesCount: number;
}
