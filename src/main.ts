import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter.js';
import { env } from './config/env.js';

/** Deve ser aplicado antes de `SwaggerModule.createDocument` para paths e Try it usarem o mesmo prefixo. */
const API_PREFIX = 'api/v1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_PREFIX);
  app.enableCors();
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('CRM API')
    .setDescription(
      'API completa de CRM com leads, contatos, empresas, deals, pipelines e tarefas',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(`http://localhost:${env.PORT}`, 'Local (rotas já incluem /api/v1)')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  app.use(
    '/scalar',
    apiReference({
      content: document,
      pageTitle: 'CRM API',
      theme: 'purple',
      baseServerURL: `http://localhost:${env.PORT}`,
    }),
  );

  await app.listen(env.PORT);
}
bootstrap();
