import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { AuthPayload } from '@/auth/types';
import {
  CreateWorkspaceDto,
  CreateWorkspaceResponseDto,
} from '@/workspace/dto/create.workspace.dto';
import { Workspace } from '@/libs/orm/entities/workspace.entity';
import {
  UpdateWorkspaceDto,
  UpdateWorkspaceResponseDto,
} from '@/workspace/dto/update.workspace.dto';
import { DeleteWorkspaceResponseDto } from '@/workspace/dto/delete.workspace.dto';
import { GetWorkspaceDto, GetWorkspaceResponseDto } from '@/workspace/dto/get.workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateWorkspaceDto, user: AuthPayload): Promise<CreateWorkspaceResponseDto> {
    try {
      const workspace = this.em.create(Workspace, {
        ...dto,
        user: user.id,
      });
      await this.em.persist(workspace).flush();
      return {
        id: workspace.id,
      };
    } catch (error) {
      throw new ConflictException('Failed to create workspace');
    }
  }
  async update(
    id: string,
    dto: UpdateWorkspaceDto,
    user: AuthPayload,
  ): Promise<UpdateWorkspaceResponseDto> {
    try {
      const workspace = await this.em.findOneOrFail(Workspace, { id, user: user.id });

      Object.assign(workspace, dto);
      await this.em.flush();
      return {
        id: workspace.id,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException)
        throw new NotFoundException('Workspace not found', 'Workspace not found');
      throw new ConflictException('Failed to update Workspace');
    }
  }
  async delete(id: string, user: AuthPayload): Promise<DeleteWorkspaceResponseDto> {
    try {
      await this.em.nativeDelete(Workspace, { id, user: user.id });
      return {};
    } catch (error: any) {
      if (error instanceof NotFoundException)
        throw new NotFoundException('Workspace not found', 'Workspace not found');
      throw new ConflictException('Failed to delete Workspace');
    }
  }

  async getAll(dto: GetWorkspaceDto, user: AuthPayload): Promise<GetWorkspaceResponseDto[]> {
    try {
      const workspaces = await this.em.find(Workspace, { user: user.id });
      return workspaces.map((workspace) => ({
        id: workspace.id,
        title: workspace.title,
        messagesCount: workspace.messages.count(),
      }));
    } catch (error: any) {
      throw new ConflictException('Failed to get workspaces');
    }
  }

  async getById(id: string, user: AuthPayload): Promise<GetWorkspaceResponseDto> {
    try {
      const workspace = await this.em.findOneOrFail(Workspace, { id, user: user.id });
      return {
        id: workspace.id,
        title: workspace.title,
        messagesCount: workspace.messages.count(),
      };
    } catch (error: any) {
      if (error instanceof NotFoundException)
        throw new NotFoundException('Workspace not found', 'Workspace not found');
      throw new ConflictException('Failed to get Workspace');
    }
  }
}
