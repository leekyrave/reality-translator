import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/core';
import { ChatService } from '@/chat/chat.service';
import { HelperService } from '@/chat/helper.service';
import { Workspace } from '@/libs/orm/entities/workspace.entity';
import { Message } from '@/libs/orm/entities/message.entity';
import { AuthPayload } from '@/auth/types';

const mockUser: AuthPayload = { id: 'user-uuid', email: 'test@test.com' };

const mockWorkspace = {
  id: 'ws-uuid',
  title: 'Test Workspace',
  user: mockUser.id,
};

const mockMessages = [
  { id: 'msg-1', role: 'user', content: 'Hello', createdAt: new Date('2024-01-01') },
  { id: 'msg-2', role: 'assistant', content: 'Hi there', createdAt: new Date('2024-01-02') },
];

const mockForkedEm = {
  create: jest.fn(),
  persist: jest.fn().mockReturnThis(),
  flush: jest.fn(),
  find: jest.fn(),
  findOneOrFail: jest.fn(),
};

const mockEm = {
  fork: jest.fn().mockReturnValue(mockForkedEm),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'BASE_OPEN_AI_URL') return 'http://localhost:11434/v1';
    if (key === 'OPEN_AI_API_KEY') return 'test-key';
    if (key === 'OPEN_AI_MODEL') return 'gemma4:large';
    return null;
  }),
};

const mockHelperService = {
  preparePrompt: jest.fn().mockReturnValue({ role: 'system', content: 'System prompt' }),
};

// OpenAI client mock — patched before module compile
const mockStreamChunks = [
  { choices: [{ delta: { content: 'Hello' } }] },
  { choices: [{ delta: { content: ' world' } }] },
];

jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

import { OpenAI } from 'openai';

describe('ChatService', () => {
  let service: ChatService;
  let openaiInstance: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: EntityManager, useValue: mockEm },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HelperService, useValue: mockHelperService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    openaiInstance = (OpenAI as jest.Mock).mock.results[0].value;
    jest.clearAllMocks();
    mockEm.fork.mockReturnValue(mockForkedEm);
    mockForkedEm.persist.mockReturnThis();
  });

  describe('saveMessage', () => {
    it('should create workspace and save user message when no workspace provided', async () => {
      mockForkedEm.create
        .mockReturnValueOnce(mockWorkspace)   // workspace
        .mockReturnValueOnce({ id: 'msg-new' }); // message
      mockForkedEm.persist.mockReturnValue({ flush: mockForkedEm.flush });

      const result = await service.saveMessage({ message: 'Hello', workspace: undefined }, mockUser);

      expect(mockForkedEm.create).toHaveBeenNthCalledWith(1, Workspace, {
        title: 'Hello',
        user: mockUser.id,
      });
      expect(mockForkedEm.create).toHaveBeenNthCalledWith(2, Message, {
        content: 'Hello',
        role: 'user',
        workspace: mockWorkspace.id,
      });
      expect(result).toEqual({ workspaceId: mockWorkspace.id });
    });

    it('should use existing workspace when workspace id is provided', async () => {
      mockForkedEm.findOneOrFail.mockResolvedValue(mockWorkspace);
      mockForkedEm.create.mockReturnValue({ id: 'msg-new' });
      mockForkedEm.persist.mockReturnValue({ flush: mockForkedEm.flush });

      const result = await service.saveMessage(
        { message: 'Hello', workspace: 'ws-uuid' },
        mockUser,
      );

      expect(mockForkedEm.findOneOrFail).toHaveBeenCalledWith(Workspace, {
        id: 'ws-uuid',
        user: mockUser.id,
      });
      expect(result).toEqual({ workspaceId: mockWorkspace.id });
    });

    it('should truncate workspace title to 50 chars', async () => {
      const longMessage = 'A'.repeat(80);
      mockForkedEm.create.mockReturnValue({ id: 'ws-uuid', title: longMessage.slice(0, 50) });
      mockForkedEm.persist.mockReturnValue({ flush: mockForkedEm.flush });

      await service.saveMessage({ message: longMessage, workspace: undefined }, mockUser);

      expect(mockForkedEm.create).toHaveBeenNthCalledWith(1, Workspace, {
        title: longMessage.slice(0, 50),
        user: mockUser.id,
      });
    });

    it('should throw when workspace not found', async () => {
      mockForkedEm.findOneOrFail.mockRejectedValue(new Error('Not found'));

      await expect(
        service.saveMessage({ message: 'Hello', workspace: 'bad-id' }, mockUser),
      ).rejects.toThrow('Not found');
    });
  });

  describe('streamResponse', () => {
    async function* makeAsyncGenerator(chunks: any[]) {
      for (const chunk of chunks) {
        yield chunk;
      }
    }

    it('should stream AI chunks, save assistant message, and emit [DONE]', (done) => {
      mockForkedEm.findOneOrFail.mockResolvedValue(mockWorkspace);
      mockForkedEm.find.mockResolvedValue(mockMessages);
      mockForkedEm.create.mockReturnValue({ id: 'assistant-msg' });
      mockForkedEm.persist.mockReturnValue({ flush: mockForkedEm.flush });

      openaiInstance.chat.completions.create = jest
        .fn()
        .mockResolvedValue(makeAsyncGenerator(mockStreamChunks));

      const received: string[] = [];
      service.streamResponse('ws-uuid', mockUser).subscribe({
        next: (event) => received.push(event.data),
        complete: () => {
          expect(received).toEqual(['Hello', ' world', '[DONE]']);

          expect(mockHelperService.preparePrompt).toHaveBeenCalledWith(mockUser.email);
          expect(mockForkedEm.find).toHaveBeenCalledWith(
            Message,
            { workspace: 'ws-uuid' },
            { orderBy: { createdAt: 'ASC' } },
          );
          expect(mockForkedEm.create).toHaveBeenCalledWith(Message, {
            content: 'Hello world',
            role: 'assistant',
            workspace: 'ws-uuid',
          });
          done();
        },
        error: done,
      });
    });

    it('should emit error when workspace is not found', (done) => {
      mockForkedEm.findOneOrFail.mockRejectedValue(new Error('Not found'));

      service.streamResponse('bad-id', mockUser).subscribe({
        next: () => {},
        complete: () => done(new Error('Should not complete')),
        error: (err) => {
          expect(err.message).toBe('Not found');
          done();
        },
      });
    });

    it('should pass full history as messages to OpenAI', (done) => {
      mockForkedEm.findOneOrFail.mockResolvedValue(mockWorkspace);
      mockForkedEm.find.mockResolvedValue(mockMessages);
      mockForkedEm.create.mockReturnValue({ id: 'assistant-msg' });
      mockForkedEm.persist.mockReturnValue({ flush: mockForkedEm.flush });

      openaiInstance.chat.completions.create = jest
        .fn()
        .mockResolvedValue(makeAsyncGenerator([]));

      service.streamResponse('ws-uuid', mockUser).subscribe({
        complete: () => {
          const callArgs = openaiInstance.chat.completions.create.mock.calls[0][0];
          expect(callArgs.messages[0]).toEqual({ role: 'system', content: 'System prompt' });
          expect(callArgs.messages[1]).toEqual({ role: 'user', content: 'Hello' });
          expect(callArgs.messages[2]).toEqual({ role: 'assistant', content: 'Hi there' });
          expect(callArgs.stream).toBe(true);
          done();
        },
        error: done,
      });
    });
  });

  describe('getHistory', () => {
    it('should return formatted message history for a workspace', async () => {
      mockForkedEm.findOneOrFail.mockResolvedValue(mockWorkspace);
      mockForkedEm.find.mockResolvedValue(mockMessages);

      const result = await service.getHistory('ws-uuid', mockUser);

      expect(mockForkedEm.findOneOrFail).toHaveBeenCalledWith(Workspace, {
        id: 'ws-uuid',
        user: mockUser.id,
      });
      expect(mockForkedEm.find).toHaveBeenCalledWith(
        Message,
        { workspace: 'ws-uuid' },
        { orderBy: { createdAt: 'ASC' } },
      );
      expect(result).toEqual([
        { id: 'msg-1', role: 'user', content: 'Hello', createdAt: mockMessages[0].createdAt },
        { id: 'msg-2', role: 'assistant', content: 'Hi there', createdAt: mockMessages[1].createdAt },
      ]);
    });

    it('should throw when workspace not found or not owned by user', async () => {
      mockForkedEm.findOneOrFail.mockRejectedValue(new Error('Not found'));

      await expect(service.getHistory('bad-id', mockUser)).rejects.toThrow('Not found');
    });

    it('should return empty array when workspace has no messages', async () => {
      mockForkedEm.findOneOrFail.mockResolvedValue(mockWorkspace);
      mockForkedEm.find.mockResolvedValue([]);

      const result = await service.getHistory('ws-uuid', mockUser);

      expect(result).toEqual([]);
    });
  });
});
