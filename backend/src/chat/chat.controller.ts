import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Sse,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChatService } from '@/chat/chat.service';
import { MessageDto, MessageResponseDto } from '@/chat/dto/message.dto';
import { RequestWithUser } from '@/auth/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HistoryResponseDto } from '@/chat/dto/history.dto';
import { StreamResponseDto } from '@/chat/dto/stream.dto';
import { FILE_SIZE_LIMIT } from '@/common/constants';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Sends a message to the chat' })
  @Post('message')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: MessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message sent',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: FILE_SIZE_LIMIT,
      },
    }),
  )
  async saveMessage(
    @Body() dto: MessageDto,
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MessageResponseDto> {
    return this.chatService.saveMessage(dto, file, req.user);
  }

  @ApiOperation({ summary: 'Starts streaming chat tokens' })
  @Sse('stream/:workspaceId')
  streamResponse(
    @Param('workspaceId') workspaceId: string,
    @Req() req: RequestWithUser,
  ): Observable<StreamResponseDto> {
    return this.chatService.streamResponse(workspaceId, req.user);
  }

  @ApiOperation({ summary: 'Retrieves chat history' })
  @Get('history/:workspaceId')
  async getHistory(
    @Param('workspaceId') workspaceId: string,
    @Req() req: RequestWithUser,
  ): Promise<HistoryResponseDto[]> {
    return this.chatService.getHistory(workspaceId, req.user);
  }
}
