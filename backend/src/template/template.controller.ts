import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { TemplateService } from '@/template/template.service';
import { GetTemplateResponseDto } from '@/template/dto/get.template.dto';
import { CreateTemplateDto, CreateTemplateResponseDto } from '@/template/dto/create.template.dto';
import { UpdateTemplateDto, UpdateTemplateResponseDto } from '@/template/dto/update.template.dto';
import { DeleteTemplateResponseDto } from '@/template/dto/delete.template.dto';
import { RequestWithUser } from '@/auth/types';
import { Template } from '@/libs/orm/entities/template.entity';
import { ApiOperation } from '@nestjs/swagger';

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @ApiOperation({ summary: 'Retrieves chat templates' })
  @Get()
  async getAll(@Req() req: RequestWithUser): Promise<GetTemplateResponseDto[]> {
    return this.templateService.getAll({}, req.user);
  }

  @ApiOperation({ summary: 'Retrieves default chat template' })
  @Get('default')
  async getDefaultTemplate(@Req() req: RequestWithUser): Promise<Template> {
    return this.templateService.getDefaultTemplate(req.user);
  }

  @ApiOperation({ summary: 'Retrieves template by id' })
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<GetTemplateResponseDto> {
    return this.templateService.getById(id, req.user);
  }

  @ApiOperation({ summary: 'Creates template' })
  @Post()
  async create(
    @Body() dto: CreateTemplateDto,
    @Req() req: RequestWithUser,
  ): Promise<CreateTemplateResponseDto> {
    return this.templateService.create(dto, req.user);
  }

  @ApiOperation({ summary: 'Updates template' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @Req() req: RequestWithUser,
  ): Promise<UpdateTemplateResponseDto> {
    return this.templateService.update(id, dto, req.user);
  }

  @ApiOperation({ summary: 'Deletes template' })
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<DeleteTemplateResponseDto> {
    return this.templateService.delete(id, req.user);
  }
}
