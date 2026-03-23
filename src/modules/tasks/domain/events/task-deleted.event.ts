import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class TaskDeletedEvent extends DomainEvent {
  constructor(public readonly taskId: string) {
    super();
  }
}
