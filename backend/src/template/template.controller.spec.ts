import { Test, TestingModule } from '@nestjs/testing';
import { TemplateController } from '@/template/template.controller';
import { TemplateService } from '@/template/template.service';
import { AuthPayload, RequestWithUser } from '@/auth/types';

const mockUser: AuthPayload = { id: 'user-uuid', email: 'test@test.com' };
const mockReq = { user: mockUser } as RequestWithUser;

const mockTemplateService = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('TemplateController', () => {
  let controller: TemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateController],
      providers: [{ provide: TemplateService, useValue: mockTemplateService }],
    }).compile();

    controller = module.get<TemplateController>(TemplateController);
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should call service.getById and return the result', async () => {
      const expected = { id: 'template-uuid', title: 'T', content: 'C', role: 'r' };
      mockTemplateService.getById.mockResolvedValue(expected);

      const result = await controller.getById('template-uuid', mockReq);

      expect(mockTemplateService.getById).toHaveBeenCalledWith('template-uuid', mockUser);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should call service.create and return the result', async () => {
      const dto = { title: 'T', role: 'assistant', content: 'C' };
      mockTemplateService.create.mockResolvedValue({ id: 'template-uuid' });

      const result = await controller.create(dto, mockReq);

      expect(mockTemplateService.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual({ id: 'template-uuid' });
    });
  });

  describe('update', () => {
    it('should call service.update and return the result', async () => {
      const dto = { title: 'Updated' };
      mockTemplateService.update.mockResolvedValue({ id: 'template-uuid' });

      const result = await controller.update('template-uuid', dto, mockReq);

      expect(mockTemplateService.update).toHaveBeenCalledWith('template-uuid', dto, mockUser);
      expect(result).toEqual({ id: 'template-uuid' });
    });
  });

  describe('delete', () => {
    it('should call service.delete and return empty object', async () => {
      mockTemplateService.delete.mockResolvedValue({});

      const result = await controller.delete('template-uuid', mockReq);

      expect(mockTemplateService.delete).toHaveBeenCalledWith('template-uuid', mockUser);
      expect(result).toEqual({});
    });
  });
});
