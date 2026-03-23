import { DomainEvent } from '../../../../shared/domain/domain-event.js';
import { DealStage } from '../enums/deal-stage.enum.js';

export class DealStageMovedEvent extends DomainEvent {
  constructor(
    public readonly dealId: string,
    public readonly stage: DealStage,
  ) {
    super();
  }
}
