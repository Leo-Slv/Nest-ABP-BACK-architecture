import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class ContactCreatedEvent extends DomainEvent {
  constructor(public readonly contactId: string) {
    super();
  }
}
