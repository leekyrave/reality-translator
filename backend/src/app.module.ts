import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './mikro-orm.config';
import { AuthModule } from '@/auth/auth.module';
import { TemplateModule } from '@/template/template.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { WorkspaceModule } from '@/workspace/workspace.module';
import { ChatModule } from '@/chat/chat.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 500,
        },
      ],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    AuthModule,
    TemplateModule,
    WorkspaceModule,
    ChatModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
