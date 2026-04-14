import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTemplateDto, CreateTemplateResponseDto } from '@/template/dto/create.template.dto';
import { UpdateTemplateDto, UpdateTemplateResponseDto } from '@/template/dto/update.template.dto';
import { DeleteTemplateDto, DeleteTemplateResponseDto } from '@/template/dto/delete.template.dto';
import { EntityManager } from '@mikro-orm/core';
import { Template } from '@/libs/orm/entities/template.entity';
import { GetTemplateDto, GetTemplateResponseDto } from '@/template/dto/get.template.dto';

@Injectable()
export class TemplateService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateTemplateDto): Promise<CreateTemplateResponseDto> {
    try {
      const template = this.em.create(Template, dto);
      await this.em.persist(template).flush();
      return {
        id: template.id,
      };
    } catch (error) {
      throw new ConflictException('Failed to create template');
    }
  }
  async update(dto: UpdateTemplateDto): Promise<UpdateTemplateResponseDto> {
    try {
      const template = await this.em.findOneOrFail(Template, { id: dto.id });

      Object.assign(template, dto);
      return {
        id: template.id,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException)
        throw new NotFoundException('Template not found', 'Template not found');
      throw new ConflictException('Failed to update template');
    }
  }
  async delete(id: string): Promise<DeleteTemplateResponseDto> {
    try {
      await this.em.nativeDelete(Template, { id: dto.id });
      return {};
    } catch (error: any) {
      if (error instanceof NotFoundException)
        throw new NotFoundException('Template not found', 'Template not found');
      throw new ConflictException('Failed to delete template');
    }
  }

  async getAll(userId: string, dto: GetTemplateDto): Promise<GetTemplateResponseDto[]> {
    try {
      const templates = await this.em.find(Template, { user: userId });
      return templates.map((template) => ({
        id: template.id,
        title: template.title,
        content: template.content,
        role: template.role,
      }));
    } catch (error: any) {
      throw new ConflictException('Failed to get templates');
    }
  }

  async getById(id: string): Promise<GetTemplateResponseDto> {
    try {
      const template = await this.em.findOneOrFail(Template, { id });
      return {
        id: template.id,
        title: template.title,
        content: template.content,
        role: template.role,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException)
        throw new NotFoundException('Template not found', 'Template not found');
      throw new ConflictException('Failed to get template');
    }
  }
}
