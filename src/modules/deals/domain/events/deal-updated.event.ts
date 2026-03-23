import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class DealUpdatedEvent extends DomainEvent {
  constructor(public readonly dealId: string) {
    super();
  }
}
