import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type {
  IDomainEventDispatcher,
  DomainEventHandler,
} from '../domain/domain-event-dispatcher.js';
import type { DomainEvent } from '../domain/domain-event.js';
import { PrismaService } from '../database/prisma.service.js';
import { DomainEventHandlerRegistry } from './domain-event-handler-registry.impl.js';
import { serializeDomainEvent } from './outbox-domain-event-serializer.js';

/**
 * Persists domain events to the outbox table; handlers run asynchronously via {@link OutboxEventProcessor}.
 */
@Injectable()
export class DomainEventDispatcher implements IDomainEventDispatcher {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: DomainEventHandlerRegistry,
  ) {}

  registerHandler<T extends DomainEvent>(
    eventClass: new (...args: unknown[]) => T,
    handler: DomainEventHandler<T>,
  ): void {
    this.registry.registerHandler(eventClass, handler);
  }

  async dispatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const { eventName, payload } = serializeDomainEvent(event);
      await this.prisma.outboxEvent.create({
        data: { eventName, payload: payload as Prisma.InputJsonValue },
      });
    }
  }
}
