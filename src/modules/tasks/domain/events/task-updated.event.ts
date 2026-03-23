import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class TaskUpdatedEvent extends DomainEvent {
  constructor(public readonly taskId: string) {
    super();
  }
}
