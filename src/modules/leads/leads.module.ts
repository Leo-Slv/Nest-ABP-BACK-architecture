import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module.js';
import { ContactsModule } from '../contacts/contacts.module.js';
import { LeadController } from './presentation/controllers/lead.controller.js';
import { LeadRepositoryFactory } from './infrastructure/repositories/lead.repository.factory.js';
import { LeadFactory } from './domain/factories/lead.factory.js';
import { LeadCreatedEventHandler } from './application/handlers/lead-created.handler.js';
import { LeadUpdatedEventHandler } from './application/handlers/lead-updated.handler.js';
import { CreateLeadUseCase } from './application/use-cases/create-lead.usecase.js';
import { UpdateLeadUseCase } from './application/use-cases/update-lead.usecase.js';
import { DeleteLeadUseCase } from './application/use-cases/delete-lead.usecase.js';
import { FindLeadUseCase } from './application/use-cases/find-lead.usecase.js';
import { ListLeadsUseCase } from './application/use-cases/list-leads.usecase.js';
import { ConvertLeadUseCase } from './application/use-cases/convert-lead.usecase.js';

@Module({
  imports: [DatabaseModule, ContactsModule],
  controllers: [LeadController],
  providers: [
    LeadRepositoryFactory,
    LeadFactory,
    LeadCreatedEventHandler,
    LeadUpdatedEventHandler,
    CreateLeadUseCase,
    UpdateLeadUseCase,
    DeleteLeadUseCase,
    FindLeadUseCase,
    ListLeadsUseCase,
    ConvertLeadUseCase,
  ],
  exports: [],
})
export class LeadsModule {}
