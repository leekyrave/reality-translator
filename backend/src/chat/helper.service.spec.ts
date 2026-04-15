import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/core';
import { HelperService } from '@/chat/helper.service';
import { ALLOWED_TYPES, FILE_SIZE_LIMIT } from '@/common/constants';


jest.mock('mammoth', () => ({
  extractRawText: jest.fn(),
}));

jest.mock('pdf-parse', () => ({
  PDFParse: jest.fn(),
}));

import * as mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';


function makeFile(overrides: Partial<Express.Multer.File>): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'test.txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    size: 100,
    buffer: Buffer.from('hello'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  };
}


describe('HelperService', () => {
  let service: HelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HelperService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: EntityManager, useValue: {} },
      ],
    }).compile();

    service = module.get<HelperService>(HelperService);
    jest.clearAllMocks();
  });


  describe('preparePrompt', () => {
    it('returns system role prompt containing the user name', () => {
      const prompt = service.preparePrompt('Alice');
      expect(prompt.role).toBe('system');
      expect(prompt.content).toContain('Alice');
    });
  });


  describe('generateTitlePrompt', () => {
    it('includes the content slice in the prompt', () => {
      const prompt = service.generateTitlePrompt('some content');
      expect(prompt.role).toBe('system');
      expect(prompt.content).toContain('some content');
    });
  });


  describe('validateFile', () => {
    it('does not throw for a valid PDF within size limit', () => {
      const file = makeFile({ mimetype: 'application/pdf', size: 1024 });
      expect(() => service.validateFile(file)).not.toThrow();
    });

    it('throws BadRequestException when file exceeds size limit', () => {
      const file = makeFile({ size: FILE_SIZE_LIMIT + 1 });
      expect(() => service.validateFile(file)).toThrow(BadRequestException);
    });

    it('throws BadRequestException for disallowed MIME type', () => {
      const file = makeFile({ mimetype: 'application/octet-stream' });
      expect(() => service.validateFile(file)).toThrow(BadRequestException);
    });

    it.each(ALLOWED_TYPES)('accepts allowed MIME type: %s', (mime) => {
      const file = makeFile({ mimetype: mime });
      expect(() => service.validateFile(file)).not.toThrow();
    });
  });


  describe('extractTextFromFile', () => {
    it('extracts text from a DOCX file', async () => {
      const file = makeFile({
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: Buffer.from('docx bytes'),
      });
      (mammoth.extractRawText as jest.Mock).mockResolvedValue({ value: '  DOCX content  ' });

      const result = await service.extractTextFromFile(file);

      expect(mammoth.extractRawText).toHaveBeenCalledWith({ buffer: file.buffer });
      expect(result).toBe('DOCX content');
    });

    it('reads plain text files as UTF-8', async () => {
      const file = makeFile({
        mimetype: 'text/plain',
        buffer: Buffer.from('  plain text  ', 'utf-8'),
      });

      const result = await service.extractTextFromFile(file);

      expect(result).toBe('plain text');
    });

    it('reads markdown files as plain text', async () => {
      const file = makeFile({
        mimetype: 'text/markdown',
        buffer: Buffer.from('# Heading\nBody', 'utf-8'),
      });

      const result = await service.extractTextFromFile(file);

      expect(result).toBe('# Heading\nBody');
    });

    it('reads CSV files as plain text', async () => {
      const file = makeFile({
        mimetype: 'text/csv',
        buffer: Buffer.from('a,b,c\n1,2,3', 'utf-8'),
      });

      const result = await service.extractTextFromFile(file);

      expect(result).toBe('a,b,c\n1,2,3');
    });
  });


  describe('buildMessageContent', () => {
    it('returns plain user text when no file provided', () => {
      expect(service.buildMessageContent('Hello')).toBe('Hello');
    });

    it('appends file name and extracted text to user message', () => {
      const file = makeFile({ originalname: 'report.pdf' });
      const result = service.buildMessageContent('Summarize this', file, 'Extracted PDF text');

      expect(result).toBe('Summarize this\n\n[Attached file: report.pdf]\nExtracted PDF text');
    });

    it('returns plain user text when file present but no extracted text', () => {
      const file = makeFile({ originalname: 'empty.pdf' });
      const result = service.buildMessageContent('Hello', file, '');

      expect(result).toBe('Hello');
    });
  });
});
