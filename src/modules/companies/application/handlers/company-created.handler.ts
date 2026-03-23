import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { CompanyCreatedEvent } from '../../domain/events/company-created.event.js';

@Injectable()
export class CompanyCreatedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(CompanyCreatedEvent, this.handle.bind(this));
  }

  private async handle(event: CompanyCreatedEvent): Promise<void> {
    console.debug(`[CompanyCreatedEvent] Company ${event.companyId} was created`);
  }
}
