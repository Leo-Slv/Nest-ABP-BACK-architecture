import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class CompanyCreatedEvent extends DomainEvent {
  constructor(public readonly companyId: string) {
    super();
  }
}
