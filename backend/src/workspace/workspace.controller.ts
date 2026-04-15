import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { RequestWithUser } from '@/auth/types';
import { WorkspaceService } from '@/workspace/workspace.service';
import { GetWorkspaceResponseDto } from '@/workspace/dto/get.workspace.dto';
import {
  CreateWorkspaceDto,
  CreateWorkspaceResponseDto,
} from '@/workspace/dto/create.workspace.dto';
import {
  UpdateWorkspaceDto,
  UpdateWorkspaceResponseDto,
} from '@/workspace/dto/update.workspace.dto';
import { DeleteWorkspaceResponseDto } from '@/workspace/dto/delete.workspace.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @ApiOperation({ summary: 'Retrieves all workspaces' })
  @Get()
  async getAll(@Req() req: RequestWithUser): Promise<GetWorkspaceResponseDto[]> {
    return this.workspaceService.getAll({}, req.user);
  }

  @ApiOperation({ summary: 'Retrieves workspace by id' })
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<GetWorkspaceResponseDto> {
    return this.workspaceService.getById(id, req.user);
  }

  @ApiOperation({ summary: 'Creates workspace' })
  @Post()
  async create(
    @Body() dto: CreateWorkspaceDto,
    @Req() req: RequestWithUser,
  ): Promise<CreateWorkspaceResponseDto> {
    return this.workspaceService.create(dto, req.user);
  }

  @ApiOperation({ summary: 'Updates workspace' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
    @Req() req: RequestWithUser,
  ): Promise<UpdateWorkspaceResponseDto> {
    return this.workspaceService.update(id, dto, req.user);
  }

  @ApiOperation({ summary: 'Deletes workspace' })
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<DeleteWorkspaceResponseDto> {
    return this.workspaceService.delete(id, req.user);
  }
}
