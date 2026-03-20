import { Injectable, Inject } from '@nestjs/common';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { Lead } from '../../domain/entities/lead.entity.js';
import { Email } from '../../../contacts/domain/value-objects/email.vo.js';
import { Phone } from '../../../contacts/domain/value-objects/phone.vo.js';
import { LeadSource } from '../../domain/value-objects/lead-source.vo.js';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.js';
import type { CreateLeadDto } from '../dtos/create-lead.dto.js';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';

@Injectable()
export class CreateLeadUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly repository: ILeadRepository,
  ) {}

  async execute(dto: CreateLeadDto): Promise<Lead> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError(`Lead com email ${dto.email} já existe`);
    }

    new Email(dto.email);
    if (dto.phone) new Phone(dto.phone);
    if (dto.source) new LeadSource(dto.source);

    return this.repository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      source: dto.source ?? null,
      status: (dto.status as LeadStatus) ?? LeadStatus.NEW,
      notes: dto.notes ?? null,
    });
  }
}
