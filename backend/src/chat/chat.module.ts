import { Module } from '@nestjs/common';
import { ChatController } from '@/chat/chat.controller';
import { ChatService } from '@/chat/chat.service';
import { HelperService } from '@/chat/helper.service';

@Module({
  imports: [],
  providers: [ChatService, HelperService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
