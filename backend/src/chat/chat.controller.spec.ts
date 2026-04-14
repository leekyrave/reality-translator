import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { ChatController } from '@/chat/chat.controller';
import { ChatService } from '@/chat/chat.service';
import { AuthPayload, RequestWithUser } from '@/auth/types';

const mockUser: AuthPayload = { id: 'user-uuid', email: 'test@test.com' };
const mockReq = { user: mockUser } as RequestWithUser;

const mockChatService = {
  saveMessage: jest.fn(),
  streamResponse: jest.fn(),
  getHistory: jest.fn(),
};

describe('ChatController', () => {
  let controller: ChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: mockChatService }],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    jest.clearAllMocks();
  });

  describe('POST /chat/message', () => {
    it('should call service.saveMessage with dto, file, and user', async () => {
      mockChatService.saveMessage.mockResolvedValue({ workspaceId: 'ws-uuid' });

      const dto = { message: 'Hello', workspace: undefined, file: undefined as any };
      const file = { originalname: 'doc.pdf' } as Express.Multer.File;
      const result = await controller.saveMessage(dto, mockReq, file);

      expect(mockChatService.saveMessage).toHaveBeenCalledWith(dto, file, mockUser);
      expect(result).toEqual({ workspaceId: 'ws-uuid' });
    });

    it('should pass workspace id when provided', async () => {
      mockChatService.saveMessage.mockResolvedValue({ workspaceId: 'ws-uuid' });

      const dto = { message: 'Hello', workspace: 'ws-uuid', file: undefined as any };
      await controller.saveMessage(dto, mockReq, undefined as any);

      expect(mockChatService.saveMessage).toHaveBeenCalledWith(dto, undefined, mockUser);
    });
  });

  describe('SSE /chat/stream/:workspaceId', () => {
    it('should return observable from service.streamResponse', (done) => {
      const events = [{ data: 'Hello' }, { data: ' world' }, { data: '[DONE]' }];
      mockChatService.streamResponse.mockReturnValue(of(...events));

      const stream$ = controller.streamResponse('ws-uuid', mockReq);

      expect(mockChatService.streamResponse).toHaveBeenCalledWith('ws-uuid', mockUser);

      const received: any[] = [];
      stream$.subscribe({
        next: (e) => received.push(e),
        complete: () => {
          expect(received).toEqual(events);
          done();
        },
        error: done,
      });
    });

    it('should propagate errors from service', (done) => {
      mockChatService.streamResponse.mockReturnValue(throwError(() => new Error('Stream failed')));

      controller.streamResponse('bad-id', mockReq).subscribe({
        next: () => {},
        complete: () => done(new Error('Should not complete')),
        error: (err) => {
          expect(err.message).toBe('Stream failed');
          done();
        },
      });
    });
  });

  describe('GET /chat/history/:workspaceId', () => {
    it('should call service.getHistory and return messages', async () => {
      const history = [
        { id: 'msg-1', role: 'user', content: 'Hi', createdAt: new Date() },
        { id: 'msg-2', role: 'assistant', content: 'Hello', createdAt: new Date() },
      ];
      mockChatService.getHistory.mockResolvedValue(history);

      const result = await controller.getHistory('ws-uuid', mockReq);

      expect(mockChatService.getHistory).toHaveBeenCalledWith('ws-uuid', mockUser);
      expect(result).toEqual(history);
    });

    it('should return empty array for workspace with no messages', async () => {
      mockChatService.getHistory.mockResolvedValue([]);

      const result = await controller.getHistory('ws-uuid', mockReq);

      expect(result).toEqual([]);
    });
  });
});
