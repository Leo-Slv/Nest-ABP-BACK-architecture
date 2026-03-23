import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { CompanyDeletedEvent } from '../../domain/events/company-deleted.event.js';

@Injectable()
export class CompanyDeletedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(CompanyDeletedEvent, this.handle.bind(this));
  }

  private async handle(event: CompanyDeletedEvent): Promise<void> {
    console.debug(`[CompanyDeletedEvent] Company ${event.companyId} was deleted`);
  }
}
