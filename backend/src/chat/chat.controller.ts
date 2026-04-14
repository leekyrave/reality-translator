import { Body, Controller, Get, Param, Post, Req, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChatService } from '@/chat/chat.service';
import { MessageDto } from '@/chat/dto/message.dto';
import { RequestWithUser } from '@/auth/types';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async saveMessage(
    @Body() dto: MessageDto,
    @Req() req: RequestWithUser,
  ): Promise<{ workspaceId: string }> {
    return this.chatService.saveMessage(dto, req.user);
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
