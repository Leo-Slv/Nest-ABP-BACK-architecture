import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import type { IContactRepository } from '../../domain/repositories/contact.repository.js';

@Injectable()
export class DeleteContactUseCase {
  constructor(@Inject('IContactRepository') private readonly repository: IContactRepository) {}

  async execute(id: string): Promise<void> {
    const exists = await this.repository.findById(id);
    if (!exists) {
      throw new NotFoundError(`Contato ${id} não encontrado`);
    }
    await this.repository.delete(id);
  }
}
