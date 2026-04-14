import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger: Logger = new Logger(AiService.name);
  constructor() {
    this.logger.log('AI service initialized');
  }


}
