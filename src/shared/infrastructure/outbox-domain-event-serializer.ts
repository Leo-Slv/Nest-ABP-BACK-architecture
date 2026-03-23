import type { DomainEvent } from '../domain/domain-event.js';

/**
 * Serializes a domain event to JSON-safe payload for OutboxEvent.payload.
 */
export function serializeDomainEvent(event: DomainEvent): {
  eventName: string;
  payload: Record<string, unknown>;
} {
  const eventName = event.constructor.name;
  const payload: Record<string, unknown> = {};
  for (const key of Object.keys(event)) {
    const v = (event as unknown as Record<string, unknown>)[key];
    if (v instanceof Date) {
      payload[key] = v.toISOString();
    } else {
      payload[key] = v;
    }
  }
  return { eventName, payload };
}
