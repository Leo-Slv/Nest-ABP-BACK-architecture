import type { DomainEvent } from './domain-event.js';

/**
 * Base class for Aggregate Roots.
 * Aggregates define transactional boundaries and ensure consistency.
 * All modifications must go through the Aggregate Root.
 */
export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): readonly DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearEvents(): void {
    this._domainEvents = [];
  }
}
