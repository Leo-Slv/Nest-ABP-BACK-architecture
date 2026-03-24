import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module.js';
import { DealController } from './presentation/controllers/deal.controller.js';
import { DealRepositoryFactory } from './infrastructure/repositories/deal.repository.factory.js';
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
  imports: [DatabaseModule],
  controllers: [DealController],
  providers: [
    DealRepositoryFactory,
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
  exports: [],
})
export class DealsModule {}
