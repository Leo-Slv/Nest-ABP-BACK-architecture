import { Inject, Injectable } from '@nestjs/common';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { Contact } from '../../domain/entities/contact.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { Phone } from '../../domain/value-objects/phone.vo.js';
import type { IContactRepository } from '../../domain/repositories/contact.repository.js';
import type { CreateContactDto } from '../dtos/create-contact.dto.js';

@Injectable()
export class CreateContactUseCase {
  constructor(@Inject('IContactRepository') private readonly repository: IContactRepository) {}

  async execute(dto: CreateContactDto): Promise<Contact> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError(`Contato com email ${dto.email} já existe`);
    }

    const email = new Email(dto.email);
    const phone = dto.phone ? new Phone(dto.phone) : null;

    return this.repository.create({
      name: dto.name,
      email: email.value,
      phone: phone?.value ?? null,
      role: dto.role ?? null,
      companyId: dto.companyId ?? null,
    });
  }
}
