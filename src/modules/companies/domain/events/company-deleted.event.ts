import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class CompanyDeletedEvent extends DomainEvent {
  constructor(public readonly companyId: string) {
    super();
  }
}
