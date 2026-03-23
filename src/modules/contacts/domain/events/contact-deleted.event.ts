import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class ContactDeletedEvent extends DomainEvent {
  constructor(public readonly contactId: string) {
    super();
  }
}
