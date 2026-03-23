import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class PipelineUpdatedEvent extends DomainEvent {
  constructor(public readonly pipelineId: string) {
    super();
  }
}
