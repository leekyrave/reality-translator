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
import { MessageDto } from '@/chat/dto/message.dto';
import { RequestWithUser } from '@/auth/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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
    }),
  )
  async saveMessage(
    @Body() dto: MessageDto,
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ workspaceId: string }> {
    return this.chatService.saveMessage(dto, file, req.user);
  }

  @Sse('stream/:workspaceId')
  streamResponse(
    @Param('workspaceId') workspaceId: string,
    @Req() req: RequestWithUser,
  ): Observable<{ data: string }> {
    return this.chatService.streamResponse(workspaceId, req.user);
  }

  @Get('history/:workspaceId')
  async getHistory(@Param('workspaceId') workspaceId: string, @Req() req: RequestWithUser) {
    return this.chatService.getHistory(workspaceId, req.user);
  }
}
