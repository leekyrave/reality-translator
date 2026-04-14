import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { HelperService } from '@/chat/helper.service';
import { MessageDto } from '@/chat/dto/message.dto';
import { Workspace } from '@/libs/orm/entities/workspace.entity';
import { Message } from '@/libs/orm/entities/message.entity';
import { AuthPayload } from '@/auth/types';

@Injectable()
export class ChatService {
  private readonly client: OpenAI;

  constructor(
    private readonly em: EntityManager,
    private readonly configService: ConfigService,
    private readonly helperService: HelperService,
  ) {
    this.client = new OpenAI({
      baseURL: this.configService.get<string>('BASE_OPEN_AI_URL'),
      apiKey: this.configService.get<string>('OPEN_AI_API_KEY'),
    });
  }

  async saveMessage(
    dto: MessageDto,
    file: Express.Multer.File,
    user: AuthPayload,
  ): Promise<{ workspaceId: string }> {
    const em = this.em.fork();

    let workspace: Workspace;
    if (!dto.workspace) {
      workspace = em.create(Workspace, {
        title: dto.message.slice(0, 50),
        user: user.id,
      });
      await em.persist(workspace).flush();
    } else {
      workspace = await em.findOneOrFail(Workspace, {
        id: dto.workspace,
        user: user.id,
      });
    }

    const userMessage = em.create(Message, {
      content: dto.message,
      role: 'user',
      workspace: workspace.id,
    });
    await em.persist(userMessage).flush();

    return { workspaceId: workspace.id };
  }

  streamResponse(workspaceId: string, user: AuthPayload): Observable<{ data: string }> {
    return new Observable((subscriber) => {
      (async () => {
        try {
          const em = this.em.fork();

          await em.findOneOrFail(Workspace, { id: workspaceId, user: user.id });

          const history = await em.find(
            Message,
            { workspace: workspaceId },
            { orderBy: { createdAt: 'ASC' } },
          );

          const systemPrompt = this.helperService.preparePrompt(user.email ?? 'User');
          const messages = [
            systemPrompt,
            ...history.map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          ];

          const model = this.configService.get<string>('OPEN_AI_MODEL') ?? 'gemma4:large';

          const stream = await this.client.chat.completions.create({
            model,
            messages,
            stream: true,
          });

          let fullContent = '';

          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
              fullContent += delta;
              subscriber.next({ data: delta });
            }
          }

          const assistantMessage = em.create(Message, {
            content: fullContent,
            role: 'assistant',
            workspace: workspaceId,
          });
          await em.persist(assistantMessage).flush();

          subscriber.next({ data: '[DONE]' });
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      })();
    });
  }

  async getHistory(
    workspaceId: string,
    user: AuthPayload,
  ): Promise<{ id: string; role: string; content: string; createdAt?: Date }[]> {
    const em = this.em.fork();

    await em.findOneOrFail(Workspace, { id: workspaceId, user: user.id });

    const messages = await em.find(
      Message,
      { workspace: workspaceId },
      { orderBy: { createdAt: 'ASC' } },
    );

    return messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));
  }
}
