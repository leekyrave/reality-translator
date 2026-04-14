import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TemplateService } from '@/template/template.service';
import { GetTemplateResponseDto } from '@/template/dto/get.template.dto';
import { CreateTemplateDto, CreateTemplateResponseDto } from '@/template/dto/create.template.dto';
import { UpdateTemplateDto, UpdateTemplateResponseDto } from '@/template/dto/update.template.dto';
import { DeleteTemplateDto, DeleteTemplateResponseDto } from '@/template/dto/delete.template.dto';

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<GetTemplateResponseDto> {
    return this.templateService.getById(id);
  }

  @Post()
  async create(@Body() dto: CreateTemplateDto): Promise<CreateTemplateResponseDto> {
    return this.templateService.create(dto);
  }

  @Patch()
  async update(@Body() dto: UpdateTemplateDto): Promise<UpdateTemplateResponseDto> {
    return this.templateService.update(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DeleteTemplateResponseDto> {
    return this.templateService.delete(id);
  }
}
