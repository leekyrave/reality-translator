import { ImageService } from '@/image/image.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
