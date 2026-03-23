import { Global, Module } from '@nestjs/common';
import { DomainEventDispatcher } from './infrastructure/domain-event-dispatcher.impl.js';
import type { IDomainEventDispatcher } from './domain/domain-event-dispatcher.js';

@Global()
@Module({
  providers: [
    {
      provide: 'IDomainEventDispatcher',
      useClass: DomainEventDispatcher,
    },
  ],
  exports: ['IDomainEventDispatcher'],
})
export class DomainEventsModule {}
