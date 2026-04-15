import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
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
    const map: Record<string, string> = {
      BASE_OPEN_AI_URL: 'http://localhost:11434/v1',
      OPEN_AI_API_KEY: 'test-key',
      OPEN_AI_MODEL: 'gemma4:small',
    };
    return map[key] ?? null;
  }),
};

const mockHelperService = {
  preparePrompt: jest.fn().mockReturnValue({ role: 'system', content: 'System prompt' }),
  validateFile: jest.fn(),
  extractTextFromFile: jest.fn(),
  buildMessageContent: jest.fn(),
};

jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

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
    mockForkedEm.persist.mockReturnValue({ flush: mockForkedEm.flush });
  });


  describe('saveMessage', () => {
    it('creates workspace and saves user message when no workspace id given', async () => {
      mockForkedEm.create
        .mockReturnValueOnce(mockWorkspace)
        .mockReturnValueOnce({ id: 'msg-new' });

      const result = await service.saveMessage(
        { message: 'Hello', workspace: undefined, file: undefined as any },
        undefined,
        mockUser,
      );

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

    it('uses existing workspace when id is provided', async () => {
      mockForkedEm.findOneOrFail.mockResolvedValue(mockWorkspace);
      mockForkedEm.create.mockReturnValue({ id: 'msg-new' });

      const result = await service.saveMessage(
        { message: 'Hello', workspace: 'ws-uuid', file: undefined as any },
        undefined,
        mockUser,
      );

      expect(mockForkedEm.findOneOrFail).toHaveBeenCalledWith(Workspace, {
        id: 'ws-uuid',
        user: mockUser.id,
      });
      expect(result).toEqual({ workspaceId: mockWorkspace.id });
    });

    it('truncates workspace title to 50 characters', async () => {
      const longMessage = 'A'.repeat(80);
      mockForkedEm.create.mockReturnValue({ id: 'ws-uuid', title: longMessage.slice(0, 50) });

      await service.saveMessage(
        { message: longMessage, workspace: undefined, file: undefined as any },
        undefined,
        mockUser,
      );

      expect(mockForkedEm.create).toHaveBeenNthCalledWith(1, Workspace, {
        title: longMessage.slice(0, 50),
        user: mockUser.id,
      });
    });

    it('throws when workspace not found', async () => {
      mockForkedEm.findOneOrFail.mockRejectedValue(new Error('Not found'));

      await expect(
        service.saveMessage(
          { message: 'Hello', workspace: 'bad-id', file: undefined as any },
          undefined,
          mockUser,
        ),
      ).rejects.toThrow('Not found');
    });


    it('validates and extracts text from uploaded file', async () => {
      const file = {
        originalname: 'doc.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('pdf content'),
      } as Express.Multer.File;

      mockHelperService.extractTextFromFile.mockResolvedValue('Extracted PDF text');
      mockHelperService.buildMessageContent.mockReturnValue(
        'Hello\n\n[Attached file: doc.pdf]\nExtracted PDF text',
      );
      mockForkedEm.create
        .mockReturnValueOnce(mockWorkspace)
        .mockReturnValueOnce({ id: 'msg-new' });

      await service.saveMessage(
        { message: 'Hello', workspace: undefined, file: undefined as any },
        file,
        mockUser,
      );

      expect(mockHelperService.validateFile).toHaveBeenCalledWith(file);
      expect(mockHelperService.extractTextFromFile).toHaveBeenCalledWith(file);
      expect(mockHelperService.buildMessageContent).toHaveBeenCalledWith(
        'Hello',
        file,
        'Extracted PDF text',
      );
      expect(mockForkedEm.create).toHaveBeenNthCalledWith(2, Message, {
        content: 'Hello\n\n[Attached file: doc.pdf]\nExtracted PDF text',
        role: 'user',
        workspace: mockWorkspace.id,
      });
    });

    it('throws BadRequestException when file validation fails', async () => {
      const file = {
        originalname: 'bad.exe',
        mimetype: 'application/octet-stream',
        size: 1024,
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      mockHelperService.validateFile.mockImplementation(() => {
        throw new BadRequestException('Unsupported file type');
      });
      mockForkedEm.create.mockReturnValueOnce(mockWorkspace);

      await expect(
        service.saveMessage(
          { message: 'Hello', workspace: undefined, file: undefined as any },
          file,
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('saves plain text message without file processing when no file provided', async () => {
      mockForkedEm.create
        .mockReturnValueOnce(mockWorkspace)
        .mockReturnValueOnce({ id: 'msg-new' });

      await service.saveMessage(
        { message: 'Plain message', workspace: undefined, file: undefined as any },
        undefined,
        mockUser,
      );

      expect(mockHelperService.validateFile).not.toHaveBeenCalled();
      expect(mockHelperService.extractTextFromFile).not.toHaveBeenCalled();
      expect(mockForkedEm.create).toHaveBeenNthCalledWith(2, Message, {
        content: 'Plain message',
        role: 'user',
        workspace: mockWorkspace.id,
      });
    });
  });


  describe('streamResponse', () => {
    async function* makeStream(chunks: any[]) {
      for (const chunk of chunks) yield chunk;
    }

    const streamChunks = [
      { choices: [{ delta: { content: 'Hello' } }] },
      { choices: [{ delta: { content: ' world' } }] },
    ];

    it('streams AI chunks, saves assistant message, and emits [DONE]', (done) => {
      mockForkedEm.findOneOrFail.mockResolvedValue(mockWorkspace);
      mockForkedEm.find.mockResolvedValue(mockMessages);
      mockForkedEm.create.mockReturnValue({ id: 'assistant-msg' });
      mockHelperService.preparePrompt.mockReturnValue({ role: 'system', content: 'System prompt' });
      openaiInstance.chat.completions.create = jest
        .fn()
        .mockResolvedValue(makeStream(streamChunks));

      const received: string[] = [];
      service.streamResponse('ws-uuid', mockUser).subscribe({
        next: (e) => received.push(e.data),
        complete: () => {
          expect(received).toEqual(['Hello', ' world', '[DONE]']);
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

    it('builds correct messages array with system prompt and history', (done) => {
      mockForkedEm.findOneOrFail.mockResolvedValue(mockWorkspace);
      mockForkedEm.find.mockResolvedValue(mockMessages);
      mockForkedEm.create.mockReturnValue({ id: 'assistant-msg' });
      mockHelperService.preparePrompt.mockReturnValue({ role: 'system', content: 'System prompt' });
      openaiInstance.chat.completions.create = jest.fn().mockResolvedValue(makeStream([]));

      service.streamResponse('ws-uuid', mockUser).subscribe({
        complete: () => {
          const callArgs = openaiInstance.chat.completions.create.mock.calls[0][0];
          expect(callArgs.messages).toEqual([
            { role: 'system', content: 'System prompt' },
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi there' },
          ]);
          expect(callArgs.stream).toBe(true);
          expect(callArgs.model).toBe('gemma4:small');
          done();
        },
        error: done,
      });
    });

    it('emits error when workspace not found', (done) => {
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

    it('skips empty delta chunks', (done) => {
      const chunksWithEmpty = [
        { choices: [{ delta: { content: 'Hi' } }] },
        { choices: [{ delta: {} }] },
        { choices: [{ delta: { content: '' } }] },
        { choices: [{ delta: { content: '!' } }] },
      ];
      mockForkedEm.findOneOrFail.mockResolvedValue(mockWorkspace);
      mockForkedEm.find.mockResolvedValue([]);
      mockForkedEm.create.mockReturnValue({ id: 'assistant-msg' });
      mockHelperService.preparePrompt.mockReturnValue({ role: 'system', content: 'System' });
      openaiInstance.chat.completions.create = jest
        .fn()
        .mockResolvedValue(makeStream(chunksWithEmpty));

      const received: string[] = [];
      service.streamResponse('ws-uuid', mockUser).subscribe({
        next: (e) => received.push(e.data),
        complete: () => {
          expect(received).toEqual(['Hi', '!', '[DONE]']);
          done();
        },
        error: done,
      });
    });
  });


  describe('getHistory', () => {
    it('returns formatted message history ordered by createdAt', async () => {
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

    it('returns empty array for workspace with no messages', async () => {
      mockForkedEm.findOneOrFail.mockResolvedValue(mockWorkspace);
      mockForkedEm.find.mockResolvedValue([]);

      expect(await service.getHistory('ws-uuid', mockUser)).toEqual([]);
    });

    it('throws when workspace not owned by user', async () => {
      mockForkedEm.findOneOrFail.mockRejectedValue(new Error('Not found'));

      await expect(service.getHistory('bad-id', mockUser)).rejects.toThrow('Not found');
    });
  });
});
