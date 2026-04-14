import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceController } from '@/workspace/workspace.controller';
import { WorkspaceService } from '@/workspace/workspace.service';
import { AuthPayload, RequestWithUser } from '@/auth/types';

const mockUser: AuthPayload = { id: 'user-uuid', email: 'test@test.com' };
const mockReq = { user: mockUser } as RequestWithUser;

const mockWorkspaceService = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('WorkspaceController', () => {
  let controller: WorkspaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [{ provide: WorkspaceService, useValue: mockWorkspaceService }],
    }).compile();

    controller = module.get<WorkspaceController>(WorkspaceController);
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should call service.getById and return the result', async () => {
      const expected = { id: 'workspace-uuid', title: 'My Workspace', messagesCount: 3 };
      mockWorkspaceService.getById.mockResolvedValue(expected);

      const result = await controller.getById('workspace-uuid', mockReq);

      expect(mockWorkspaceService.getById).toHaveBeenCalledWith('workspace-uuid', mockUser);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should call service.create and return the result', async () => {
      const dto = { title: 'My Workspace' };
      mockWorkspaceService.create.mockResolvedValue({ id: 'workspace-uuid' });

      const result = await controller.create(dto, mockReq);

      expect(mockWorkspaceService.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual({ id: 'workspace-uuid' });
    });
  });

  describe('update', () => {
    it('should call service.update and return the result', async () => {
      const dto = { title: 'Updated Workspace' };
      mockWorkspaceService.update.mockResolvedValue({ id: 'workspace-uuid' });

      const result = await controller.update('workspace-uuid', dto, mockReq);

      expect(mockWorkspaceService.update).toHaveBeenCalledWith('workspace-uuid', dto, mockUser);
      expect(result).toEqual({ id: 'workspace-uuid' });
    });
  });

  describe('delete', () => {
    it('should call service.delete and return empty object', async () => {
      mockWorkspaceService.delete.mockResolvedValue({});

      const result = await controller.delete('workspace-uuid', mockReq);

      expect(mockWorkspaceService.delete).toHaveBeenCalledWith('workspace-uuid', mockUser);
      expect(result).toEqual({});
    });
  });
});
