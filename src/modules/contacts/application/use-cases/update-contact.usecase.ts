import { Inject, Injectable } from '@nestjs/common';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { Contact } from '../../domain/entities/contact.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { Phone } from '../../domain/value-objects/phone.vo.js';
import type { IContactRepository } from '../../domain/repositories/contact.repository.js';
import type { UpdateContactDto } from '../dtos/update-contact.dto.js';

@Injectable()
export class UpdateContactUseCase {
  constructor(@Inject('IContactRepository') private readonly repository: IContactRepository) {}

  async execute(id: string, dto: UpdateContactDto): Promise<Contact> {
    const contact = await this.repository.findById(id);
    if (!contact) {
      throw new NotFoundError(`Contato ${id} não encontrado`);
    }

    if (dto.email && dto.email !== contact.email) {
      const existing = await this.repository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictError(`Contato com email ${dto.email} já existe`);
      }
    }

    const email = dto.email ? new Email(dto.email).value : contact.email;
    const phone = dto.phone !== undefined ? (dto.phone ? new Phone(dto.phone).value : null) : contact.phone;

    return this.repository.update(id, {
      name: dto.name ?? contact.name,
      email,
      phone,
      role: dto.role !== undefined ? dto.role : contact.role,
      companyId: dto.companyId !== undefined ? dto.companyId : contact.companyId,
    });
  }
}
