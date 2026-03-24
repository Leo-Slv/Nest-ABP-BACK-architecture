import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module.js';
import { TaskController } from './presentation/controllers/task.controller.js';
import { TaskRepositoryFactory } from './infrastructure/repositories/task.repository.factory.js';
import { TaskCreatedEventHandler } from './application/handlers/task-created.handler.js';
import { TaskUpdatedEventHandler } from './application/handlers/task-updated.handler.js';
import { TaskCompletedEventHandler } from './application/handlers/task-completed.handler.js';
import { TaskDeletedEventHandler } from './application/handlers/task-deleted.handler.js';
import { TaskFactory } from './domain/factories/task.factory.js';
import { CreateTaskUseCase } from './application/use-cases/create-task.usecase.js';
import { UpdateTaskUseCase } from './application/use-cases/update-task.usecase.js';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.usecase.js';
import { FindTaskUseCase } from './application/use-cases/find-task.usecase.js';
import { ListTasksUseCase } from './application/use-cases/list-tasks.usecase.js';
import { CompleteTaskUseCase } from './application/use-cases/complete-task.usecase.js';

@Module({
  imports: [DatabaseModule],
  controllers: [TaskController],
  providers: [
    TaskRepositoryFactory,
    TaskCreatedEventHandler,
    TaskUpdatedEventHandler,
    TaskCompletedEventHandler,
    TaskDeletedEventHandler,
    TaskFactory,
    CreateTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    FindTaskUseCase,
    ListTasksUseCase,
    CompleteTaskUseCase,
  ],
  exports: [],
})
export class TasksModule {}
