import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/database/prisma.module.js';
import { LeadsModule } from '../leads/leads.module.js';
import { ContactsModule } from '../contacts/contacts.module.js';
import { CompaniesModule } from '../companies/companies.module.js';
import { DealsModule } from '../deals/deals.module.js';
import { TaskController } from './presentation/controllers/task.controller.js';
import { TaskPrismaRepository } from './infrastructure/repositories/task.prisma.repository.js';
import { CreateTaskUseCase } from './application/use-cases/create-task.usecase.js';
import { UpdateTaskUseCase } from './application/use-cases/update-task.usecase.js';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.usecase.js';
import { FindTaskUseCase } from './application/use-cases/find-task.usecase.js';
import { ListTasksUseCase } from './application/use-cases/list-tasks.usecase.js';
import { CompleteTaskUseCase } from './application/use-cases/complete-task.usecase.js';

@Module({
  imports: [
    PrismaModule,
    LeadsModule,
    ContactsModule,
    CompaniesModule,
    DealsModule,
  ],
  controllers: [TaskController],
  providers: [
    {
      provide: 'ITaskRepository',
      useClass: TaskPrismaRepository,
    },
    CreateTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    FindTaskUseCase,
    ListTasksUseCase,
    CompleteTaskUseCase,
  ],
})
export class TasksModule {}
