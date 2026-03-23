import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class TaskCompletedEvent extends DomainEvent {
  constructor(public readonly taskId: string) {
    super();
  }
}
