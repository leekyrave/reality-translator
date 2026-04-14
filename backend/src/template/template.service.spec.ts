import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TemplateService } from '@/template/template.service';
import { Template } from '@/libs/orm/entities/template.entity';
import { AuthPayload } from '@/auth/types';

const mockUser: AuthPayload = { id: 'user-uuid', email: 'test@test.com' };

const mockTemplate = {
  id: 'template-uuid',
  title: 'My Template',
  role: 'assistant',
  content: 'Hello {{name}}',
  user: mockUser.id,
};

const mockEm = {
  create: jest.fn(),
  persist: jest.fn().mockReturnThis(),
  flush: jest.fn(),
  find: jest.fn(),
  findOneOrFail: jest.fn(),
  nativeDelete: jest.fn(),
};

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        { provide: EntityManager, useValue: mockEm },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a template and return its id', async () => {
      mockEm.create.mockReturnValue(mockTemplate);
      mockEm.persist.mockReturnValue({ flush: mockEm.flush });

      const result = await service.create(
        { title: 'My Template', role: 'assistant', content: 'Hello {{name}}' },
        mockUser,
      );

      expect(mockEm.create).toHaveBeenCalledWith(Template, {
        title: 'My Template',
        role: 'assistant',
        content: 'Hello {{name}}',
        user: mockUser.id,
      });
      expect(result).toEqual({ id: mockTemplate.id });
    });

    it('should throw ConflictException on error', async () => {
      mockEm.create.mockReturnValue(mockTemplate);
      mockEm.persist.mockReturnValue({
        flush: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(
        service.create(
          { title: 'My Template', role: 'assistant', content: 'Hello' },
          mockUser,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a template and return its id', async () => {
      mockEm.findOneOrFail.mockResolvedValue({ ...mockTemplate });

      const result = await service.update(
        mockTemplate.id,
        { title: 'Updated Title' },
        mockUser,
      );

      expect(mockEm.findOneOrFail).toHaveBeenCalledWith(Template, {
        id: mockTemplate.id,
        user: mockUser.id,
      });
      expect(result).toEqual({ id: mockTemplate.id });
    });

    it('should throw ConflictException when template not found', async () => {
      mockEm.findOneOrFail.mockRejectedValue(new Error('Not found'));

      await expect(
        service.update(mockTemplate.id, { title: 'Updated' }, mockUser),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete a template and return empty object', async () => {
      mockEm.nativeDelete.mockResolvedValue(1);

      const result = await service.delete(mockTemplate.id, mockUser);

      expect(mockEm.nativeDelete).toHaveBeenCalledWith(Template, {
        id: mockTemplate.id,
        user: mockUser.id,
      });
      expect(result).toEqual({});
    });

    it('should throw ConflictException on error', async () => {
      mockEm.nativeDelete.mockRejectedValue(new Error('DB error'));

      await expect(
        service.delete(mockTemplate.id, mockUser),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getAll', () => {
    it('should return all templates for the user', async () => {
      mockEm.find.mockResolvedValue([mockTemplate]);

      const result = await service.getAll({}, mockUser);

      expect(mockEm.find).toHaveBeenCalledWith(Template, { user: mockUser.id });
      expect(result).toEqual([
        {
          id: mockTemplate.id,
          title: mockTemplate.title,
          content: mockTemplate.content,
          role: mockTemplate.role,
        },
      ]);
    });

    it('should return empty array when no templates exist', async () => {
      mockEm.find.mockResolvedValue([]);

      const result = await service.getAll({}, mockUser);

      expect(result).toEqual([]);
    });

    it('should throw ConflictException on error', async () => {
      mockEm.find.mockRejectedValue(new Error('DB error'));

      await expect(service.getAll({}, mockUser)).rejects.toThrow(ConflictException);
    });
  });

  describe('getById', () => {
    it('should return a template by id', async () => {
      mockEm.findOneOrFail.mockResolvedValue(mockTemplate);

      const result = await service.getById(mockTemplate.id, mockUser);

      expect(mockEm.findOneOrFail).toHaveBeenCalledWith(Template, {
        id: mockTemplate.id,
        user: mockUser.id,
      });
      expect(result).toEqual({
        id: mockTemplate.id,
        title: mockTemplate.title,
        content: mockTemplate.content,
        role: mockTemplate.role,
      });
    });

    it('should throw ConflictException when template not found', async () => {
      mockEm.findOneOrFail.mockRejectedValue(new Error('Not found'));

      await expect(
        service.getById('nonexistent-id', mockUser),
      ).rejects.toThrow(ConflictException);
    });
  });
});
