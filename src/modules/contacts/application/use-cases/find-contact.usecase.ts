import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { ContactNotFoundError } from '../../../../shared/errors/contact-not-found.error.js';
import { Contact } from '../../domain/entities/contact.entity.js';
import { ContactRepositoryFactory } from '../../infrastructure/repositories/contact.repository.factory.js';

@Injectable()
export class FindContactUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly contactRepositoryFactory: ContactRepositoryFactory,
  ) {}

  async execute(id: string): Promise<Contact> {
    return this.uow.execute(async (ctx) => {
      const repository = this.contactRepositoryFactory.create(ctx);
      const contact = await repository.findById(id);
      if (!contact) {
        throw new ContactNotFoundError(id);
      }
      return contact;
    });
  }
}
