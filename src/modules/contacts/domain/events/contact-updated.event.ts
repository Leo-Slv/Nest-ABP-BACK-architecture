import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class ContactUpdatedEvent extends DomainEvent {
  constructor(public readonly contactId: string) {
    super();
  }
}
