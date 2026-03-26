import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { DomainEventHandlerRegistry } from './domain-event-handler-registry.impl.js';
import { deserializeDomainEvent } from './outbox-domain-event-factory.js';
import { PrismaService } from './database/prisma.service.js';

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
    private readonly prisma: PrismaService,
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
      const rows = await this.prisma.outboxEvent.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: BATCH,
        select: { id: true, eventName: true, payload: true },
      });

      for (const row of rows) {
        const event = deserializeDomainEvent(row.eventName, row.payload);
        if (!event) {
          await this.prisma.outboxEvent.update({
            where: { id: row.id },
            data: {
              status: 'FAILED',
              error: `Unknown eventName: ${row.eventName}`.slice(0, 4000),
            },
          });
          continue;
        }
        try {
          await this.registry.dispatchToHandlers([event]);
          await this.prisma.outboxEvent.update({
            where: { id: row.id },
            data: { status: 'PROCESSED', processedAt: new Date() },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          await this.prisma.outboxEvent.update({
            where: { id: row.id },
            data: { status: 'FAILED', error: message.slice(0, 4000) },
          });
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
