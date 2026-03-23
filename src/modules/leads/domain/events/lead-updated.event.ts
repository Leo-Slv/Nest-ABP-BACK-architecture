import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class LeadUpdatedEvent extends DomainEvent {
  constructor(public readonly leadId: string) {
    super();
  }
}
