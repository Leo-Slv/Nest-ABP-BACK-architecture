import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { CompanyUpdatedEvent } from '../../domain/events/company-updated.event.js';

@Injectable()
export class CompanyUpdatedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(CompanyUpdatedEvent, this.handle.bind(this));
  }

  private async handle(event: CompanyUpdatedEvent): Promise<void> {
    console.debug(`[CompanyUpdatedEvent] Company ${event.companyId} was updated`);
  }
}
