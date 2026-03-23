import { Injectable, Inject } from '@nestjs/common';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { Lead } from '../../domain/entities/lead.entity.js';
import { LeadEmailUniqueSpec } from '../../domain/specifications/lead-email-unique.specification.js';
import { LeadFactory } from '../../domain/factories/lead.factory.js';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.js';
import type { CreateLeadDto } from '../dtos/create-lead.dto.js';

@Injectable()
export class CreateLeadUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly repository: ILeadRepository,
    private readonly emailUniqueSpec: LeadEmailUniqueSpec,
    private readonly factory: LeadFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dto: CreateLeadDto): Promise<Lead> {
    const emailUnique = await this.emailUniqueSpec.isSatisfiedBy(dto.email);
    if (!emailUnique) {
      throw new ConflictError(`Lead com email ${dto.email} já existe`);
    }

    const lead = this.factory.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      source: dto.source ?? null,
      status: dto.status,
      notes: dto.notes ?? null,
    });

    const saved = await this.repository.create(lead);
    const events = lead.getDomainEvents();
    await this.eventDispatcher.dispatch(events);

    return saved;
  }
}
