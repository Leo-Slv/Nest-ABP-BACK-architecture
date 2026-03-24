import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { Pool } from 'pg';
import { DATABASE_POOL } from './database/database.tokens.js';
import { DomainEventHandlerRegistry } from './domain-event-handler-registry.impl.js';
import { deserializeDomainEvent } from './outbox-domain-event-factory.js';

const POLL_MS = 2000;
const BATCH = 50;

/**
 * Polls pending outbox rows and dispatches them to registered domain event handlers.
 */
@Injectable()
export class OutboxEventProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(OutboxEventProcessor.name);
  private timer?: ReturnType<typeof setInterval>;

  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly registry: DomainEventHandlerRegistry,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.tick();
    }, POLL_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    try {
      const { rows } = await this.pool.query<{
        id: string;
        eventName: string;
        payload: unknown;
      }>(
        `SELECT "id", "eventName", "payload" FROM "OutboxEvent"
         WHERE "status" = 'PENDING'::"OutboxEventStatus"
         ORDER BY "createdAt" ASC
         LIMIT $1`,
        [BATCH],
      );

      for (const row of rows) {
        const event = deserializeDomainEvent(row.eventName, row.payload);
        if (!event) {
          await this.pool.query(
            `UPDATE "OutboxEvent" SET "status" = 'FAILED'::"OutboxEventStatus", "error" = $2
             WHERE "id" = $1`,
            [row.id, `Unknown eventName: ${row.eventName}`],
          );
          continue;
        }
        try {
          await this.registry.dispatchToHandlers([event]);
          await this.pool.query(
            `UPDATE "OutboxEvent" SET "status" = 'PROCESSED'::"OutboxEventStatus", "processedAt" = NOW()
             WHERE "id" = $1`,
            [row.id],
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          await this.pool.query(
            `UPDATE "OutboxEvent" SET "status" = 'FAILED'::"OutboxEventStatus", "error" = $2
             WHERE "id" = $1`,
            [row.id, message.slice(0, 4000)],
          );
          this.log.error(`Outbox ${row.id} failed: ${message}`);
        }
      }
    } catch (e) {
      this.log.error(
        `Outbox poll failed: ${e instanceof Error ? e.message : e}`,
      );
    }
  }
}
