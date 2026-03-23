import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/database/prisma.module.js';
import { ContactsModule } from '../contacts/contacts.module.js';
import { CompaniesModule } from '../companies/companies.module.js';
import { PipelinesModule } from '../pipelines/pipelines.module.js';
import { DealController } from './presentation/controllers/deal.controller.js';
import { DealPrismaRepository } from './infrastructure/repositories/deal.prisma.repository.js';
import { DealCreatedEventHandler } from './application/handlers/deal-created.handler.js';
import { DealUpdatedEventHandler } from './application/handlers/deal-updated.handler.js';
import { DealStageMovedEventHandler } from './application/handlers/deal-stage-moved.handler.js';
import { DealFactory } from './domain/factories/deal.factory.js';
import { CreateDealUseCase } from './application/use-cases/create-deal.usecase.js';
import { UpdateDealUseCase } from './application/use-cases/update-deal.usecase.js';
import { DeleteDealUseCase } from './application/use-cases/delete-deal.usecase.js';
import { FindDealUseCase } from './application/use-cases/find-deal.usecase.js';
import { ListDealsUseCase } from './application/use-cases/list-deals.usecase.js';
import { MoveDealStageUseCase } from './application/use-cases/move-deal-stage.usecase.js';

@Module({
  imports: [PrismaModule, ContactsModule, CompaniesModule, PipelinesModule],
  controllers: [DealController],
  providers: [
    {
      provide: 'IDealRepository',
      useClass: DealPrismaRepository,
    },
    DealCreatedEventHandler,
    DealUpdatedEventHandler,
    DealStageMovedEventHandler,
    DealFactory,
    CreateDealUseCase,
    UpdateDealUseCase,
    DeleteDealUseCase,
    FindDealUseCase,
    ListDealsUseCase,
    MoveDealStageUseCase,
  ],
})
export class DealsModule {}
