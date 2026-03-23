import { Global, Module } from '@nestjs/common';
import { DomainEventDispatcher } from './infrastructure/domain-event-dispatcher.impl.js';
import { DomainEventHandlerRegistry } from './infrastructure/domain-event-handler-registry.impl.js';
import { OutboxEventProcessor } from './infrastructure/outbox-event-processor.service.js';
import type { IDomainEventDispatcher } from './domain/domain-event-dispatcher.js';

@Global()
@Module({
  providers: [
    DomainEventHandlerRegistry,
    {
      provide: 'IDomainEventDispatcher',
      useClass: DomainEventDispatcher,
    },
    OutboxEventProcessor,
  ],
  exports: ['IDomainEventDispatcher'],
})
export class DomainEventsModule {}
