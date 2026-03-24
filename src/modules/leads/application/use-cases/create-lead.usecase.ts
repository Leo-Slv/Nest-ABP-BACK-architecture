import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import { Lead } from '../../domain/entities/lead.entity.js';
import { LeadEmailUniqueSpec } from '../../domain/specifications/lead-email-unique.specification.js';
import { LeadFactory } from '../../domain/factories/lead.factory.js';
import { LeadRepositoryFactory } from '../../infrastructure/repositories/lead.repository.factory.js';
import type { CreateLeadDto } from '../dtos/create-lead.dto.js';

@Injectable()
export class CreateLeadUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly leadRepositoryFactory: LeadRepositoryFactory,
    private readonly factory: LeadFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dto: CreateLeadDto): Promise<Lead> {
    const events: DomainEvent[] = [];

    const saved = await this.uow.execute(async (ctx) => {
      const repository = this.leadRepositoryFactory.create(ctx);
      const email = new Email(dto.email);
      const spec = new LeadEmailUniqueSpec(repository);
      const emailUnique = await spec.isSatisfiedBy(email);
      if (!emailUnique) {
        throw new ConflictError(`Lead com email ${email.value} já existe`);
      }

      const lead = this.factory.create({
        name: dto.name,
        email: dto.email,
        phone: dto.phone ?? null,
        source: dto.source ?? null,
        status: dto.status,
        notes: dto.notes ?? null,
      });

      const out = await repository.create(lead);
      events.push(...lead.getDomainEvents());
      return out;
    });

    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
