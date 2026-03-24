import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { Contact } from '../../domain/entities/contact.entity.js';
import { ContactRepositoryFactory } from '../../infrastructure/repositories/contact.repository.factory.js';
import type { ListContactsDto } from '../dtos/list-contacts.dto.js';

export interface ListContactsResult {
  data: Contact[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ListContactsUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly contactRepositoryFactory: ContactRepositoryFactory,
  ) {}

  async execute(dto: ListContactsDto): Promise<ListContactsResult> {
    return this.uow.execute(async (ctx) => {
      const repository = this.contactRepositoryFactory.create(ctx);
      return repository.list({
        page: dto.page,
        limit: dto.limit,
        search: dto.search,
      });
    });
  }
}
