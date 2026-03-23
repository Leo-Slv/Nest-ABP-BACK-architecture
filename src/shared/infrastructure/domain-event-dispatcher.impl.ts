import { Injectable } from '@nestjs/common';
import type {
  IDomainEventDispatcher,
  DomainEventHandler,
} from '../domain/domain-event-dispatcher.js';
import type { DomainEvent } from '../domain/domain-event.js';

@Injectable()
export class DomainEventDispatcher implements IDomainEventDispatcher {
  private readonly handlers = new Map<
    string,
    DomainEventHandler<DomainEvent>[]
  >();

  registerHandler<T extends DomainEvent>(
    eventClass: new (...args: unknown[]) => T,
    handler: DomainEventHandler<T>,
  ): void {
    const key = eventClass.name;
    const list = this.handlers.get(key) ?? [];
    list.push(handler as DomainEventHandler<DomainEvent>);
    this.handlers.set(key, list);
  }

  async dispatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const key = event.constructor.name;
      const list = this.handlers.get(key) ?? [];
      for (const handler of list) {
        await handler(event);
      }
    }
  }
}
