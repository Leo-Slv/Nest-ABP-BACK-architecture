import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class LeadCreatedEvent extends DomainEvent {
  constructor(public readonly leadId: string) {
    super();
  }
}
