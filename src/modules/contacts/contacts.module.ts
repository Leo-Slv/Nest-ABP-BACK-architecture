import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/database/prisma.module.js';
import { ContactController } from './presentation/controllers/contact.controller.js';
import { ContactPrismaRepository } from './infrastructure/repositories/contact.prisma.repository.js';
import { ContactEmailUniqueSpec } from './domain/specifications/contact-email-unique.specification.js';
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
  imports: [PrismaModule],
  controllers: [ContactController],
  providers: [
    {
      provide: 'IContactRepository',
      useClass: ContactPrismaRepository,
    },
    ContactEmailUniqueSpec,
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
