import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '@/common/filters/exception.filter';
import * as cookieParser from 'cookie-parser';
import expressBasicAuth from 'express-basic-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(require('cookie-parser')());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: config.get<string>('FRONTEND_URL') ?? '*',
    credentials: true,
  });

  app.use(
    ['api/docs'],
    expressBasicAuth({
      challenge: true,
      users: {
        [config.get<string>('SWAGGER_USER') as string]: config.get<string>(
          'SWAGGER_PASSWORD',
        ) as string,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Skyfi.stack')
    .setDescription('The skyfistack api')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('PORT') ?? 5000;

  await app.listen(port);
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger is available at http://localhost:${port}/api/docs`);
}
void bootstrap();
