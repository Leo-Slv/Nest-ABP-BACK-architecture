import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class PipelineCreatedEvent extends DomainEvent {
  constructor(public readonly pipelineId: string) {
    super();
  }
}
