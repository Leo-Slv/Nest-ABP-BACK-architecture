import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module.js';
import { ContactController } from './presentation/controllers/contact.controller.js';
import { ContactRepositoryFactory } from './infrastructure/repositories/contact.repository.factory.js';
import { ContactCreatedEventHandler } from './application/handlers/contact-created.handler.js';
import { ContactUpdatedEventHandler } from './application/handlers/contact-updated.handler.js';
import { ContactDeletedEventHandler } from './application/handlers/contact-deleted.handler.js';
import { ContactFactory } from './domain/factories/contact.factory.js';
import { CreateContactUseCase } from './application/use-cases/create-contact.usecase.js';
import { UpdateContactUseCase } from './application/use-cases/update-contact.usecase.js';
import { DeleteContactUseCase } from './application/use-cases/delete-contact.usecase.js';
import { FindContactUseCase } from './application/use-cases/find-contact.usecase.js';
import { ListContactsUseCase } from './application/use-cases/list-contacts.usecase.js';

@Module({
  imports: [DatabaseModule],
  controllers: [ContactController],
  providers: [
    ContactRepositoryFactory,
    ContactCreatedEventHandler,
    ContactUpdatedEventHandler,
    ContactDeletedEventHandler,
    ContactFactory,
    CreateContactUseCase,
    UpdateContactUseCase,
    DeleteContactUseCase,
    FindContactUseCase,
    ListContactsUseCase,
  ],
  exports: [CreateContactUseCase],
})
export class ContactsModule {}
