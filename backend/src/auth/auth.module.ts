import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import type { StringValue } from 'ms';
import { AuthService } from '@/auth/auth.service';
import { AuthController } from '@/auth/auth.controller';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { TemplateModule } from '@/template/template.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') as StringValue },
      }),
    }),
    TemplateModule,
  ],
  providers: [AuthService, JwtStrategy, JwtGuard],
  controllers: [AuthController],
  exports: [JwtGuard],
})
export class AuthModule {}
