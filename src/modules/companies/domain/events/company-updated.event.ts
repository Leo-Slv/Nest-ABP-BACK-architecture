import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class CompanyUpdatedEvent extends DomainEvent {
  constructor(public readonly companyId: string) {
    super();
  }
}
