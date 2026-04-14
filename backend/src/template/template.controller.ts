import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { TemplateService } from '@/template/template.service';
import { GetTemplateResponseDto } from '@/template/dto/get.template.dto';
import { CreateTemplateDto, CreateTemplateResponseDto } from '@/template/dto/create.template.dto';
import { UpdateTemplateDto, UpdateTemplateResponseDto } from '@/template/dto/update.template.dto';
import { DeleteTemplateDto, DeleteTemplateResponseDto } from '@/template/dto/delete.template.dto';
import { RequestWithUser } from '@/auth/types';

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<GetTemplateResponseDto> {
    return this.templateService.getById(id, req.user);
  }

  @Post()
  async create(
    @Body() dto: CreateTemplateDto,
    @Req() req: RequestWithUser,
  ): Promise<CreateTemplateResponseDto> {
    return this.templateService.create(dto, req.user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @Req() req: RequestWithUser,
  ): Promise<UpdateTemplateResponseDto> {
    return this.templateService.update(id, dto, req.user);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<DeleteTemplateResponseDto> {
    return this.templateService.delete(id, req.user);
  }
}
