import type { DomainEvent } from './domain-event.js';

export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (
  event: T,
) => void | Promise<void>;

/**
 * Dispatches domain events to registered handlers.
 * Application layer uses this after persistence to propagate domain facts.
 */
export interface IDomainEventDispatcher {
  dispatch(events: DomainEvent[]): Promise<void>;
  registerHandler<T extends DomainEvent>(
    eventClass: new (...args: unknown[]) => T,
    handler: DomainEventHandler<T>,
  ): void;
}
