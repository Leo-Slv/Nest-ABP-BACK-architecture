import { Inject, Injectable } from '@nestjs/common';
import { Contact } from '../../domain/entities/contact.entity.js';
import type { IContactRepository } from '../../domain/repositories/contact.repository.js';
import type { ListContactsDto } from '../dtos/list-contacts.dto.js';

export interface ListContactsResult {
  data: Contact[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ListContactsUseCase {
  constructor(@Inject('IContactRepository') private readonly repository: IContactRepository) {}

  async execute(dto: ListContactsDto): Promise<ListContactsResult> {
    return this.repository.list({
      page: dto.page,
      limit: dto.limit,
      search: dto.search,
    });
  }
}
