import { Injectable, Inject } from '@nestjs/common';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import { Phone } from '../../../../shared/domain/value-objects/phone.vo.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { Lead } from '../../domain/entities/lead.entity.js';
import { LeadSource } from '../../domain/value-objects/lead-source.vo.js';
import { LeadEmailUniqueSpec } from '../../domain/specifications/lead-email-unique.specification.js';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.js';
import type { UpdateLeadDto } from '../dtos/update-lead.dto.js';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';

@Injectable()
export class UpdateLeadUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly repository: ILeadRepository,
    private readonly emailUniqueSpec: LeadEmailUniqueSpec,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string, dto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.repository.findById(id);
    if (!lead) {
      throw new NotFoundError(`Lead ${id} não encontrado`);
    }

    if (lead.status === LeadStatus.CONVERTED) {
      throw new ConflictError('Lead já convertido não pode ser editado');
    }

    if (dto.email && dto.email !== lead.emailValue) {
      const emailUnique = await this.emailUniqueSpec.isSatisfiedBy(new Email(dto.email), id);
      if (!emailUnique) {
        throw new ConflictError(`Lead com email ${dto.email} já existe`);
      }
      lead.changeEmail(new Email(dto.email));
    }
    if (dto.name !== undefined) lead.changeName(new Name(dto.name));
    if (dto.phone !== undefined) {
      lead.changePhone(dto.phone ? new Phone(dto.phone) : null);
    }
    if (dto.source !== undefined) {
      lead.changeSource(dto.source ? new LeadSource(dto.source) : null);
    }
    if (dto.status !== undefined) lead.changeStatus(dto.status as LeadStatus);
    if (dto.notes !== undefined) lead.changeNotes(dto.notes);

    const saved = await this.repository.update(lead);
    const events = lead.getDomainEvents();
    await this.eventDispatcher.dispatch(events);

    return saved;
  }
}
