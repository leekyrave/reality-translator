import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import { parse as csvParse } from 'csv-parse/sync';
import mammoth from 'mammoth';

interface TextExtractionResult {
  content: string;
  format: 'pdf' | 'txt' | 'md' | 'csv' | 'docx';
}

@Injectable()
export class TextService {
  async extract(buffer: Buffer, mimeType: string): Promise<TextExtractionResult> {
    switch (mimeType) {
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.extractDocx(buffer);
      case 'application/pdf':
        return this.extractPdf(buffer);
      case 'text/csv':
        return this.extractCsv(buffer);
      case 'text/plain':
        return this.extractPlain(buffer, 'txt');
      case 'text/markdown':
        return this.extractPlain(buffer, 'md');
      default:
        throw new BadRequestException(`Unsupported text type: ${mimeType}`);
    }
  }

  private async extractPdf(buffer: Buffer): Promise<TextExtractionResult> {
    try {
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      return {
        content: this.removeNoise(data.text),
        format: 'pdf',
      };
    } catch (e) {
      throw new BadRequestException('Invalid PDF file');
    }
  }

  private async extractDocx(buffer: Buffer): Promise<TextExtractionResult> {
    try {
      const result = await mammoth.convertToHtml({ buffer: buffer });
      return {
        content: this.removeNoise(result.value),
        format: 'docx',
      };
    } catch (e) {
      throw new BadRequestException('Invalid DOCX file');
    }
  }

  private async extractCsv(buffer: Buffer): Promise<TextExtractionResult> {
    const text = buffer.toString('utf-8');
    const delimiter = text.indexOf(';') > text.indexOf(',') ? ';' : ',';
    try {
      const records = csvParse(buffer.toString('utf-8'), {
        skip_empty_lines: true,
        trim: true,
        delimiter,
      });

      const sanitized = records.map((row) => row.map((cell) => this.sanitizeCsvCell(cell)));

      const content = sanitized.map((row) => row.join(' | ')).join('\n');

      return { content, format: 'csv' };
    } catch (e) {
      throw new BadRequestException('Invalid CSV file');
    }
  }

  private async extractPlain(buffer: Buffer, format: 'txt' | 'md'): Promise<TextExtractionResult> {
    return {
      content: this.removeNoise(buffer.toString('utf-8')),
      format,
    };
  }

  private removeNoise(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/ {2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[^\S\n]+$/gm, '')
      .trim();
  }

  private sanitizeCsvCell(value: string): string {
    if (/^[=+\-@]/.test(value)) {
      return `'${value}`;
    }
    return value;
  }
}
