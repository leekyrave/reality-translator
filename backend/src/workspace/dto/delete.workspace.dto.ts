import { Exclude } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class WorkspaceTemplateDto {}

@Exclude()
export class DeleteWorkspaceResponseDto {}
