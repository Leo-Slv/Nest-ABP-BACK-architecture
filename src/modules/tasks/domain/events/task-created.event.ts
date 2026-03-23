import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class TaskCreatedEvent extends DomainEvent {
  constructor(public readonly taskId: string) {
    super();
  }
}
