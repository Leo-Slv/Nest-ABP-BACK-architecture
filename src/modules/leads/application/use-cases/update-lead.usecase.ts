import { Injectable, Inject } from '@nestjs/common';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { Lead } from '../../domain/entities/lead.entity.js';
import { Email } from '../../../contacts/domain/value-objects/email.vo.js';
import { Phone } from '../../../contacts/domain/value-objects/phone.vo.js';
import { LeadSource } from '../../domain/value-objects/lead-source.vo.js';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.js';
import type { UpdateLeadDto } from '../dtos/update-lead.dto.js';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';

@Injectable()
export class UpdateLeadUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly repository: ILeadRepository,
  ) {}

  async execute(id: string, dto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.repository.findById(id);
    if (!lead) {
      throw new NotFoundError(`Lead ${id} não encontrado`);
    }

    if (lead.status === LeadStatus.CONVERTED) {
      throw new ConflictError('Lead já convertido não pode ser editado');
    }

    if (dto.email && dto.email !== lead.email) {
      const existing = await this.repository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictError(`Lead com email ${dto.email} já existe`);
      }
      new Email(dto.email);
    }
    if (dto.phone !== undefined && dto.phone) new Phone(dto.phone);
    if (dto.source) new LeadSource(dto.source);

    return this.repository.update(id, {
      name: dto.name ?? lead.name,
      email: dto.email ?? lead.email,
      phone: dto.phone !== undefined ? dto.phone : lead.phone,
      source: dto.source !== undefined ? dto.source : lead.source,
      status: dto.status !== undefined ? (dto.status as LeadStatus) : lead.status,
      notes: dto.notes !== undefined ? dto.notes : lead.notes,
    });
  }
}
