import { Module } from '@nestjs/common';
import { TextService } from '@/processing/text.service';

@Module({
  imports: [],
  controllers: [],
  providers: [TextService],
  exports: [TextService],
})
export class ProcessingModule {}
