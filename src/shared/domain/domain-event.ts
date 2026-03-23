/**
 * Base class for domain events.
 * Domain events represent facts that occurred in the domain and propagate changes between aggregates.
 */
export abstract class DomainEvent {
  readonly occurredAt: Date = new Date();
}
