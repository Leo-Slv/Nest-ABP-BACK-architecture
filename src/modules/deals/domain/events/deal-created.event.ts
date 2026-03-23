import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class DealCreatedEvent extends DomainEvent {
  constructor(public readonly dealId: string) {
    super();
  }
}
