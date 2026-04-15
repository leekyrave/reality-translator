import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { WorkspaceService } from '@/workspace/workspace.service';
import { Workspace } from '@/libs/orm/entities/workspace.entity';
import { Message } from '@/libs/orm/entities/message.entity';
import { AuthPayload } from '@/auth/types';

const mockUser: AuthPayload = { id: 'user-uuid', email: 'test@test.com' };

const mockWorkspace = {
  id: 'workspace-uuid',
  title: 'My Workspace',
  user: mockUser.id,
};

const mockEm = {
  create: jest.fn(),
  persist: jest.fn().mockReturnThis(),
  flush: jest.fn(),
  find: jest.fn(),
  findOneOrFail: jest.fn(),
  nativeDelete: jest.fn(),
  count: jest.fn().mockResolvedValue(3),
};

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        { provide: EntityManager, useValue: mockEm },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
    jest.clearAllMocks();
    mockEm.count.mockResolvedValue(3);
  });

  describe('create', () => {
    it('should create a workspace and return its id', async () => {
      mockEm.create.mockReturnValue(mockWorkspace);
      mockEm.persist.mockReturnValue({ flush: mockEm.flush });

      const result = await service.create({ title: 'My Workspace' }, mockUser);

      expect(mockEm.create).toHaveBeenCalledWith(Workspace, {
        title: 'My Workspace',
        user: mockUser.id,
      });
      expect(result).toEqual({ id: mockWorkspace.id });
    });

    it('should throw ConflictException on error', async () => {
      mockEm.create.mockReturnValue(mockWorkspace);
      mockEm.persist.mockReturnValue({
        flush: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(
        service.create({ title: 'My Workspace' }, mockUser),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a workspace and return its id', async () => {
      mockEm.findOneOrFail.mockResolvedValue({ ...mockWorkspace });

      const result = await service.update(
        mockWorkspace.id,
        { title: 'Updated Title' },
        mockUser,
      );

      expect(mockEm.findOneOrFail).toHaveBeenCalledWith(Workspace, {
        id: mockWorkspace.id,
        user: mockUser.id,
      });
      expect(result).toEqual({ id: mockWorkspace.id });
    });

    it('should throw ConflictException when workspace not found', async () => {
      mockEm.findOneOrFail.mockRejectedValue(new Error('Not found'));

      await expect(
        service.update(mockWorkspace.id, { title: 'Updated' }, mockUser),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete a workspace and return empty object', async () => {
      mockEm.nativeDelete.mockResolvedValue(1);

      const result = await service.delete(mockWorkspace.id, mockUser);

      expect(mockEm.nativeDelete).toHaveBeenCalledWith(Workspace, {
        id: mockWorkspace.id,
        user: mockUser.id,
      });
      expect(result).toEqual({});
    });

    it('should throw ConflictException on error', async () => {
      mockEm.nativeDelete.mockRejectedValue(new Error('DB error'));

      await expect(
        service.delete(mockWorkspace.id, mockUser),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getAll', () => {
    it('should return all workspaces for the user with message count', async () => {
      mockEm.find.mockResolvedValue([mockWorkspace]);
      mockEm.count.mockResolvedValue(3);

      const result = await service.getAll({}, mockUser);

      expect(mockEm.find).toHaveBeenCalledWith(Workspace, { user: mockUser.id });
      expect(mockEm.count).toHaveBeenCalledWith(Message, { workspace: mockWorkspace.id });
      expect(result).toEqual([
        {
          id: mockWorkspace.id,
          title: mockWorkspace.title,
          messagesCount: 3,
        },
      ]);
    });

    it('should return empty array when no workspaces exist', async () => {
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
    it('should return a workspace by id with message count', async () => {
      mockEm.findOneOrFail.mockResolvedValue(mockWorkspace);
      mockEm.count.mockResolvedValue(3);

      const result = await service.getById(mockWorkspace.id, mockUser);

      expect(mockEm.findOneOrFail).toHaveBeenCalledWith(Workspace, {
        id: mockWorkspace.id,
        user: mockUser.id,
      });
      expect(mockEm.count).toHaveBeenCalledWith(Message, { workspace: mockWorkspace.id });
      expect(result).toEqual({
        id: mockWorkspace.id,
        title: mockWorkspace.title,
        messagesCount: 3,
      });
    });

    it('should throw ConflictException when workspace not found', async () => {
      mockEm.findOneOrFail.mockRejectedValue(new Error('Not found'));

      await expect(
        service.getById('nonexistent-id', mockUser),
      ).rejects.toThrow(ConflictException);
    });
  });
});
