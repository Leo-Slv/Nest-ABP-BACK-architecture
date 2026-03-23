# Outbox de eventos de domínio

## Fluxo

1. **Persistência**: `IDomainEventDispatcher.dispatch()` grava cada `DomainEvent` na tabela `OutboxEvent` (status `PENDING`), sem executar handlers na mesma chamada.
2. **Fila**: `OutboxEventProcessor` faz polling a cada `POLL_MS` (2s), lê até `BATCH` (50) linhas pendentes e chama `DomainEventHandlerRegistry.dispatchToHandlers`.
3. **Sucesso**: linha marcada como `PROCESSED` com `processedAt`.
4. **Falha**: `FAILED` com `error` (truncado); eventos desconhecidos (nome não mapeado em `outbox-domain-event-factory.ts`) também vão para `FAILED`.

## Ao adicionar um novo evento

1. Criar a classe em `domain/events/`.
2. Registrar o branch em `src/shared/infrastructure/outbox-domain-event-factory.ts` (`deserializeDomainEvent`).
3. Os campos serializados vêm das propriedades enumeráveis da instância (incluído `occurredAt`).

## Produção

- Para **várias instâncias**, usar `SELECT ... FOR UPDATE SKIP LOCKED` (ou fila externa) para evitar processamento duplicado.
- Para **outbox transacional** com o agregado, gravar `OutboxEvent` na mesma transação Prisma do repositório (requer injetar `Prisma`/`$transaction` no fluxo de persistência).
