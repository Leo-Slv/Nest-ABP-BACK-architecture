import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter.js';
import { env } from './config/env.js';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('CRM API')
    .setDescription(
      'API completa de CRM com leads, contatos, empresas, deals, pipelines e tarefas',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api/v1');
  app.enableCors();

  await app.listen(env.PORT);
}
bootstrap();
