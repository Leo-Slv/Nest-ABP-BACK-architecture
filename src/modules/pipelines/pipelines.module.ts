import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module.js';
import { PipelineController } from './presentation/controllers/pipeline.controller.js';
import { PipelineRepositoryFactory } from './infrastructure/repositories/pipeline.repository.factory.js';
import { PipelineCreatedEventHandler } from './application/handlers/pipeline-created.handler.js';
import { PipelineUpdatedEventHandler } from './application/handlers/pipeline-updated.handler.js';
import { PipelineFactory } from './domain/factories/pipeline.factory.js';
import { CreatePipelineUseCase } from './application/use-cases/create-pipeline.usecase.js';
import { UpdatePipelineUseCase } from './application/use-cases/update-pipeline.usecase.js';
import { DeletePipelineUseCase } from './application/use-cases/delete-pipeline.usecase.js';
import { FindPipelineUseCase } from './application/use-cases/find-pipeline.usecase.js';
import { ListPipelinesUseCase } from './application/use-cases/list-pipelines.usecase.js';

@Module({
  imports: [DatabaseModule],
  controllers: [PipelineController],
  providers: [
    PipelineRepositoryFactory,
    PipelineCreatedEventHandler,
    PipelineUpdatedEventHandler,
    PipelineFactory,
    CreatePipelineUseCase,
    UpdatePipelineUseCase,
    DeletePipelineUseCase,
    FindPipelineUseCase,
    ListPipelinesUseCase,
  ],
  exports: [],
})
export class PipelinesModule {}
